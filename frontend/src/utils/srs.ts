export const SRS = {
  /* =======================
     CONFIGURATION
     ======================= */

  TARGET_RECALL: 0.9,
  MIN_STABILITY: 0.5,
  MAX_DIFFICULTY: 1,
  MIN_DIFFICULTY: 0,

  DAY: 24 * 60 * 60 * 1000,
  MINUTE: 60 * 1000,

  /* =======================
     ENUMS
     ======================= */

  States: {
    NEW: 0,
    LEARNING: 1,
    REVIEW: 2,
    RELEARNING: 3,
  },

  Rating: {
    Again: 1,
    Hard: 2,
    Good: 3,
    Easy: 4,
  },

  /* =======================
     CARD CREATION
     ======================= */

  createEmptyCard(lastReview = new Date()) {
    return {
      stability: 0,
      difficulty: 0.3,
      reps: 0,
      lapses: 0,
      state: this.States.NEW,
      learning_steps: 0,
      last_review: lastReview,
      due: lastReview,
    };
  },

  /* =======================
     PUBLIC ENTRY POINT
     ======================= */

  review(card: any, rating: number) {
    const now = new Date();
    const elapsedDays = Math.max(
      0,
      (now.getTime() - new Date(card.last_review).getTime()) / this.DAY
    );

    const updated = { ...card };
    updated.reps += 1;
    updated.last_review = now;

    switch (updated.state) {
      case this.States.NEW:
        return this._new(updated, rating);

      case this.States.LEARNING:
        return this._learning(updated, rating);

      case this.States.REVIEW:
        return this._review(updated, rating, elapsedDays);

      case this.States.RELEARNING:
        return this._relearning(updated, rating);

      default:
        return this._new(updated, rating);
    }
  },

  /* =======================
     STATE HANDLERS
     ======================= */

  _new(card: any, rating: number) {
    card.state = this.States.LEARNING;
    card.learning_steps = 0;

    if (rating === this.Rating.Again) {
      card.due = new Date(Date.now() + 5 * this.MINUTE);
      return card;
    }

    card.stability = rating === this.Rating.Easy ? 2.5 : 1.5;
    card.difficulty = rating === this.Rating.Easy ? 0.2 : 0.3;
    card.due = new Date(Date.now() + 30 * this.MINUTE);
    return card;
  },

  _learning(card: any, rating: number) {
    const requiredSteps = Math.ceil(2 + card.difficulty * 4);

    if (rating === this.Rating.Again) {
      card.learning_steps = 0;
      card.due = new Date(Date.now() + 10 * this.MINUTE);
      return card;
    }

    card.learning_steps += 1;

    if (card.learning_steps >= requiredSteps || rating === this.Rating.Easy) {
      card.state = this.States.REVIEW;
      card.stability = Math.max(2, card.stability);
      card.due = this._scheduleFromStability(card.stability);
      return card;
    }

    const minutes = 15 + card.learning_steps * 30;
    card.due = new Date(Date.now() + minutes * this.MINUTE);
    return card;
  },

  _review(card: any, rating: number, elapsedDays: number) {
    this._updateDifficulty(card, rating);

    const recallProb = Math.exp(-elapsedDays / Math.max(card.stability, 0.1));

    if (rating === this.Rating.Again) {
      card.state = this.States.RELEARNING;
      card.lapses += 1;
      card.stability = Math.max(
        this.MIN_STABILITY,
        card.stability * 0.35
      );
      card.learning_steps = 0;
      card.due = new Date(Date.now() + 10 * this.MINUTE);
      return card;
    }

    const successFactor =
      rating === this.Rating.Easy ? 1.3 :
      rating === this.Rating.Good ? 1.0 :
      0.8;

    card.stability *= 1 + successFactor * recallProb;
    card.due = this._scheduleFromStability(card.stability);
    return card;
  },

  _relearning(card: any, rating: number) {
    if (rating === this.Rating.Again) {
      card.learning_steps = 0;
      card.due = new Date(Date.now() + 5 * this.MINUTE);
      return card;
    }

    card.learning_steps += 1;

    if (card.learning_steps >= 2 || rating === this.Rating.Easy) {
      card.state = this.States.REVIEW;
      card.stability = Math.max(2, card.stability);
      card.due = this._scheduleFromStability(card.stability);
      return card;
    }

    card.due = new Date(Date.now() + 30 * this.MINUTE);
    return card;
  },

  /* =======================
     MEMORY MODEL
     ======================= */

  _scheduleFromStability(stability: number) {
    const days =
      -stability * Math.log(this.TARGET_RECALL);

    return new Date(Date.now() + Math.max(1, days) * this.DAY);
  },

  _updateDifficulty(card: any, rating: number) {
    const delta =
      rating === this.Rating.Again ? +0.12 :
      rating === this.Rating.Hard ? +0.04 :
      rating === this.Rating.Good ? -0.02 :
      -0.08;

    card.difficulty += delta * (1 - card.difficulty);
    card.difficulty = Math.min(
      this.MAX_DIFFICULTY,
      Math.max(this.MIN_DIFFICULTY, card.difficulty)
    );
  },
};

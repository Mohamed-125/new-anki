export const SRS = {
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

  createEmptyCard: function (lastReviewDate = new Date()) {
    return {
      stability: 0,
      difficulty: 0.3,
      elapsed_days: 0,
      scheduled_days: 0,
      learning_steps: 0,
      reps: 0,
      lapses: 0,
      state: this.States.NEW,
      last_review: lastReviewDate,
      due: lastReviewDate,
    };
  },

  calculateNextInterval: function (card: any, rating: number) {
    const updatedCard = { ...card };
    updatedCard.reps += 1;
    const now = new Date();
    const daysSinceLastReview = Math.max(
      0,
      Math.floor((now.getTime() - new Date(updatedCard.last_review).getTime()) / (1000 * 60 * 60 * 24))
    );
    updatedCard.elapsed_days = daysSinceLastReview;
    updatedCard.last_review = now;

    switch (updatedCard.state) {
      case this.States.NEW:
        return this._handleNewCard(updatedCard, rating);
      case this.States.LEARNING:
        return this._handleLearningCard(updatedCard, rating);
      case this.States.REVIEW:
        return this._handleReviewCard(updatedCard, rating);
      case this.States.RELEARNING:
        return this._handleRelearningCard(updatedCard, rating);
      default:
        return this._handleNewCard(updatedCard, rating);
    }
  },

  _handleNewCard: function (card: any, rating: number) {
    switch (rating) {
      case this.Rating.Again:
        card.learning_steps = 0;
        card.due = new Date(Date.now() + 5 * 60 * 1000);
        break;
      case this.Rating.Hard:
        card.state = this.States.LEARNING;
        card.learning_steps = 1;
        card.due = new Date(Date.now() + 10 * 60 * 1000);
        break;
      case this.Rating.Good:
        card.state = this.States.LEARNING;
        card.learning_steps = 1;
        card.due = new Date(Date.now() + 60 * 60 * 1000);
        break;
      case this.Rating.Easy:
        card.state = this.States.LEARNING;
        card.learning_steps = 2;
        card.due = new Date(Date.now() + 6 * 60 * 60 * 1000);
        break;
    }
    return card;
  },

  _handleLearningCard: function (card: any, rating: number) {
    switch (rating) {
      case this.Rating.Again:
        card.learning_steps = 0;
        card.due = new Date(Date.now() + 10 * 60 * 1000);
        break;
      case this.Rating.Hard:
        card.learning_steps += 1;
        card.due = new Date(Date.now() + 45 * 60 * 1000);
        break;
      case this.Rating.Good:
        card.learning_steps += 1;
        if (card.learning_steps >= 3) {
          card.state = this.States.REVIEW;
          card.stability = 3;
          card.due = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        } else {
          const intervals = [0, 30, 240, 1440];
          const minutesToAdd = intervals[card.learning_steps] || 1440;
          card.due = new Date(Date.now() + minutesToAdd * 60 * 1000);
        }
        break;
      case this.Rating.Easy:
        card.state = this.States.REVIEW;
        card.stability = 4;
        card.due = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
        break;
    }
    return card;
  },

  _handleReviewCard: function (card: any, rating: number) {
    this._updateDifficulty(card, rating);

    switch (rating) {
      case this.Rating.Again:
        card.state = this.States.RELEARNING;
        card.lapses += 1;
        card.learning_steps = 0;
        card.stability = Math.max(0.5, card.stability * 0.4);
        card.due = new Date(Date.now() + 10 * 60 * 1000);
        break;

      case this.Rating.Hard:
        card.stability = card.stability * 1.25; // زيادة معتدلة
        card.scheduled_days = Math.max(1, Math.floor(card.stability));
        card.due = new Date(Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000);
        break;

      case this.Rating.Good:
        const stabilityMultiplier = 1.55 * (1 - 0.3 * card.difficulty);
        card.stability = card.stability * stabilityMultiplier;
        card.scheduled_days = Math.max(1, Math.floor(card.stability));
        card.due = new Date(Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000);
        break;

      case this.Rating.Easy:
        const easyMultiplier = 2.0 * (1 - 0.25 * card.difficulty);
        card.stability = card.stability * easyMultiplier;
        card.scheduled_days = Math.max(1, Math.floor(card.stability * 1.4));
        card.due = new Date(Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000);
        break;
    }

    return card;
  },

  _handleRelearningCard: function (card: any, rating: number) {
    switch (rating) {
      case this.Rating.Again:
        card.learning_steps = 0;
        card.due = new Date(Date.now() + 5 * 60 * 1000);
        break;
      case this.Rating.Hard:
        card.learning_steps += 1;
        card.due = new Date(Date.now() + 30 * 60 * 1000);
        break;
      case this.Rating.Good:
        card.learning_steps += 1;
        if (card.learning_steps >= 2) {
          card.state = this.States.REVIEW;
          card.stability = Math.max(2, card.stability);
          card.due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
        } else {
          const intervals = [0, 60, 240];
          const minutesToAdd = intervals[card.learning_steps] || 240;
          card.due = new Date(Date.now() + minutesToAdd * 60 * 1000);
        }
        break;
      case this.Rating.Easy:
        card.state = this.States.REVIEW;
        card.stability = Math.max(2, card.stability * 0.9);
        card.scheduled_days = Math.max(1, Math.floor(card.stability));
        card.due = new Date(Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000);
        break;
    }
    return card;
  },

  _updateDifficulty: function (card: any, rating: number) {
    let difficulty = card.difficulty;
    switch (rating) {
      case this.Rating.Again:
        difficulty += 0.15;
        break;
      case this.Rating.Hard:
        difficulty += 0.05;
        break;
      case this.Rating.Good:
        difficulty = difficulty + (0.3 - difficulty) * 0.08; // تعديل متوسط
        break;
      case this.Rating.Easy:
        difficulty -= 0.15;
        break;
    }
    card.difficulty = Math.min(1, Math.max(0, difficulty));
    return card;
  },
};

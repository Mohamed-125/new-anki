// SRS (Spaced Repetition System) implementation
export const SRS = {
  // Learning states
  States: {
    NEW: 0,
    LEARNING: 1,
    REVIEW: 2,
    RELEARNING: 3,
  },

  // Rating values (similar to Anki/FSRS)
  Rating: {
    Again: 1,
    Hard: 2,
    Good: 3,
    Easy: 4,
  },

  // Create a new card or reset an existing one
  createEmptyCard: function (lastReviewDate = new Date()) {
    return {
      stability: 0,
      difficulty: 0.3, // Default medium difficulty
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

  // Main algorithm for calculating intervals
  calculateNextInterval: function (card: any, rating: number) {
    // Clone the card to avoid modifying the original
    const updatedCard = { ...card };

    // Update review count
    updatedCard.reps += 1;

    // Current date for calculations
    const now = new Date();

    // Calculate days elapsed since last review
    const daysSinceLastReview = Math.max(
      0,
      Math.floor(
        (now.getTime() - new Date(updatedCard.last_review).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    updatedCard.elapsed_days = daysSinceLastReview;

    // Update last review date
    updatedCard.last_review = now;

    // Handle different states and ratings
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

  // Handle new cards
  _handleNewCard: function (card: any, rating: number) {
    switch (rating) {
      case this.Rating.Again:
        // Failed, stay in learning with short interval
        card.learning_steps = 0;
        card.due = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        break;

      case this.Rating.Hard:
        // Move to learning with short interval
        card.state = this.States.LEARNING;
        card.learning_steps = 1;
        card.due = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        break;

      case this.Rating.Good:
        // Move to learning with medium interval
        card.state = this.States.LEARNING;
        card.learning_steps = 1;
        card.due = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        break;

      case this.Rating.Easy:
        // Light learning instead of direct review
        card.state = this.States.LEARNING;
        card.learning_steps = 2;
        card.due = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 hours
        break;
    }

    return card;
  },

  // Handle cards in learning phase
  _handleLearningCard: function (card: any, rating: number) {
    switch (rating) {
      case this.Rating.Again:
        // Reset learning progress
        card.learning_steps = 0;
        card.due = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        break;

      case this.Rating.Hard:
        // Small progress in learning
        card.learning_steps += 1;
        card.due = new Date(Date.now() + 45 * 60 * 1000); // 45 minutes
        break;

      case this.Rating.Good:
        card.learning_steps += 1;

        // If completed learning steps, graduate to review
        if (card.learning_steps >= 3) {
          card.state = this.States.REVIEW;
          card.stability = 3;
          card.due = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
        } else {
          // Otherwise, increase interval within learning
          const intervals = [0, 30, 240, 1440]; // minutes: 0, 30min, 4h, 1d
          const minutesToAdd = intervals[card.learning_steps] || 1440;
          card.due = new Date(Date.now() + minutesToAdd * 60 * 1000);
        }
        break;

      case this.Rating.Easy:
        // Graduate immediately to review
        card.state = this.States.REVIEW;
        card.stability = 4;
        card.due = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days
        break;
    }

    return card;
  },

  // Handle cards in review phase
  _handleReviewCard: function (card: any, rating: number) {
    this._updateDifficulty(card, rating);

    switch (rating) {
      case this.Rating.Again:
        // Failed review, move to relearning
        card.state = this.States.RELEARNING;
        card.lapses += 1;
        card.learning_steps = 0;

        // Reduce stability
        card.stability = Math.max(0.5, card.stability * 0.4);
        card.due = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        break;

      case this.Rating.Hard:
        // Slightly harder recall
        card.stability = card.stability * 1.15;
        card.scheduled_days = Math.max(1, Math.floor(card.stability * 0.9));
        card.due = new Date(
          Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000
        );
        break;

      case this.Rating.Good:
        // Normal review success
        const stabilityMultiplier = 1.4 * (1 - 0.4 * card.difficulty);
        card.stability = card.stability * stabilityMultiplier;

        // Next interval
        card.scheduled_days = Math.max(1, Math.floor(card.stability));
        card.due = new Date(
          Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000
        );
        break;

      case this.Rating.Easy:
        // Easy recall
        const easyMultiplier = 2.0 * (1 - 0.25 * card.difficulty);
        card.stability = card.stability * easyMultiplier;

        // Slight bonus interval
        card.scheduled_days = Math.max(1, Math.floor(card.stability * 1.4));
        card.due = new Date(
          Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000
        );
        break;
    }

    return card;
  },

  // Handle cards in relearning phase
  _handleRelearningCard: function (card: any, rating: number) {
    switch (rating) {
      case this.Rating.Again:
        // Reset relearning progress
        card.learning_steps = 0;
        card.due = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        break;

      case this.Rating.Hard:
        // Small progress in relearning
        card.learning_steps += 1;
        card.due = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        break;

      case this.Rating.Good:
        card.learning_steps += 1;

        // If completed relearning steps, return to review
        if (card.learning_steps >= 2) {
          card.state = this.States.REVIEW;
          // Reduced stability compared to normal graduation
          card.stability = Math.max(2, card.stability);
          card.due = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days
        } else {
          // Otherwise, increase interval within relearning
          const intervals = [0, 60, 240]; // minutes: 0, 1h, 4h
          const minutesToAdd = intervals[card.learning_steps] || 240;
          card.due = new Date(Date.now() + minutesToAdd * 60 * 1000);
        }
        break;

      case this.Rating.Easy:
        // Return to review with slightly reduced stability
        card.state = this.States.REVIEW;
        card.stability = Math.max(2, card.stability * 0.9);
        card.scheduled_days = Math.max(1, Math.floor(card.stability));
        card.due = new Date(
          Date.now() + card.scheduled_days * 24 * 60 * 60 * 1000
        );
        break;
    }

    return card;
  },

  // Update card difficulty based on performance
  _updateDifficulty: function (card: any, rating: number) {
    // Current difficulty
    let difficulty = card.difficulty;

    // Adjust difficulty based on rating
    switch (rating) {
      case this.Rating.Again:
        difficulty += 0.15;
        break;
      case this.Rating.Hard:
        difficulty += 0.05;
        break;
      case this.Rating.Good:
        // Slight regression to the mean
        difficulty = difficulty + (0.3 - difficulty) * 0.05;
        break;
      case this.Rating.Easy:
        difficulty -= 0.15;
        break;
    }

    // Ensure difficulty stays within bounds
    card.difficulty = Math.min(1, Math.max(0, difficulty));

    return card;
  },
};
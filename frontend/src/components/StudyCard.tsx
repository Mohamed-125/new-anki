import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { CardType } from '@/hooks/useGetCards';

interface StudyCardProps {
  card: CardType;
  showAnswer: boolean;
  studyCardsView: string;
  isAudioMode: boolean;
  onShowAnswer: () => void;
  onEdit: () => void;
}

const StudyCard = memo(({ 
  card,
  showAnswer,
  studyCardsView,
  isAudioMode,
  onShowAnswer,
  onEdit
}: StudyCardProps) => {
  if (!card) return null;

  const content = studyCardsView === 'normal' ? card.front : card.back;
  
  return (
    <motion.div 
      className="flex-1 cursor-pointer" 
      onClick={() => !showAnswer && onShowAnswer()}
      layout
      layoutId={`card-${card._id}`}
    >
      <div className="mb-8 text-xl font-medium">
        {content}
      </div>
    </motion.div>
  );
});

StudyCard.displayName = 'StudyCard';

export default StudyCard;
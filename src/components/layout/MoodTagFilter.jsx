import React from 'react';
import { moodTags } from '../../data/moodTags';

export default function MoodTagFilter({ selectedMood, onSelectMood, lang }) {
  return (
    <div className="horizontal-tags-scroll-container">
      <div className="tags-scroll-inner">
        {moodTags.map((tag) => {
          const isActive = selectedMood === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              className={`mood-tag-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelectMood(tag.id)}
            >
              {lang === 'vi' ? tag.labelVi : tag.labelEn}
            </button>
          );
        })}
      </div>
    </div>
  );
}

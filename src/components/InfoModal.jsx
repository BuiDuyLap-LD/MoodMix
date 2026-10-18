import { X, ShieldCheck, FileText } from 'lucide-react';

export default function InfoModal({ isOpen, onClose, title, type = 'info', children }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'terms':
        return <FileText className="modal-title-icon text-cyan" size={22} />;
      case 'privacy':
        return <ShieldCheck className="modal-title-icon text-green" size={22} />;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            {getIcon()}
            <h3 className="modal-title">{title}</h3>
          </div>
          <button 
            className="modal-close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}

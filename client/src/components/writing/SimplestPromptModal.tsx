import React from 'react';

type PromptData = {
  prompt: string;
  scenario: string;
  guidingQuestions?: string[];
  suggestedElements?: string[];
  challengeElement?: string;
};

interface ModalProps {
  show: boolean;
  data: PromptData | null;
  onClose: () => void;
  onStart: () => void;
  onNew: () => void;
}

export function SimplestPromptModal({ show, data, onClose, onStart, onNew }: ModalProps) {
  if (!show || !data) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
    >
      <div 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '20px'
        }}
      >
        <h2 style={{ marginBottom: '15px', color: '#6366f1' }}>Your Custom Prompt is Ready!</h2>
        <p style={{ marginBottom: '10px', color: '#6b7280' }}>Review your custom prompt and start writing when ready</p>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Prompt</h3>
            <p>{data.prompt}</p>
          </div>
          
          <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Scenario</h3>
            <p>{data.scenario}</p>
          </div>
          
          {data.guidingQuestions && data.guidingQuestions.length > 0 && (
            <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Guiding Questions</h3>
              <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                {data.guidingQuestions.map((question, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{question}</li>
                ))}
              </ul>
            </div>
          )}
          
          {data.suggestedElements && data.suggestedElements.length > 0 && (
            <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Suggested Elements</h3>
              <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                {data.suggestedElements.map((element, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>{element}</li>
                ))}
              </ul>
            </div>
          )}
          
          {data.challengeElement && (
            <div style={{ backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Challenge Element</h3>
              <p>{data.challengeElement}</p>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={onNew}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            Generate New Prompt
          </button>
          
          <button
            onClick={onStart}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"></path>
            </svg>
            Start Writing
          </button>
        </div>
      </div>
    </div>
  );
}
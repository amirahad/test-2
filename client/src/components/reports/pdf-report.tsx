import React from 'react';
import { formatCurrency } from '@/lib/api';

interface PdfReportProps {
  title: string;
  notes?: string;
  period: string;
  companyName: string;
  logoUrl?: string;
  agentData?: {
    name: string;
    photoUrl?: string;
  };
  widgets: { id: string; type: string }[];
  children: React.ReactNode;
  reportType: 'agency' | 'agent';
}

export function PdfReport({
  title,
  notes,
  period,
  companyName,
  logoUrl,
  agentData,
  widgets,
  children,
  reportType
}: PdfReportProps) {
  return (
    <div className="pdf-document" style={{ fontFamily: 'Arial, sans-serif', color: '#000', background: '#fff' }}>
      {/* Cover Page */}
      <div className="pdf-page cover-page" style={{ 
        pageBreakAfter: 'always', 
        height: '297mm', 
        position: 'relative',
        padding: '2cm',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ marginBottom: '4cm' }}></div>
        
        <div style={{ textAlign: 'center' }}>
          {logoUrl && (
            <div style={{ marginBottom: '2cm' }}>
              <img 
                src={logoUrl} 
                alt={companyName} 
                style={{ maxWidth: '200px', maxHeight: '80px' }}
              />
            </div>
          )}
          
          <h1 style={{ 
            fontSize: '28pt', 
            fontWeight: 'bold', 
            marginBottom: '1cm',
            color: '#000'
          }}>
            {title}
          </h1>
          
          <p style={{ 
            fontSize: '14pt', 
            marginBottom: '0.5cm',
            color: '#444'
          }}>
            {period}
          </p>
          
          {reportType === 'agent' && agentData?.name && (
            <p style={{ 
              fontSize: '14pt', 
              marginBottom: '0.5cm',
              color: '#444'
            }}>
              Agent: {agentData.name}
            </p>
          )}
        </div>
        
        {notes && (
          <div style={{ 
            marginTop: '2cm',
            padding: '1cm',
            borderTop: '1px solid #ddd',
            borderBottom: '1px solid #ddd'
          }}>
            <p style={{ fontSize: '12pt', lineHeight: 1.5 }}>{notes}</p>
          </div>
        )}
        
        <div style={{ 
          marginTop: 'auto',
          textAlign: 'center',
          color: '#777',
          fontSize: '10pt'
        }}>
          Generated on {new Date().toLocaleDateString()}
        </div>
      </div>
      
      {/* Report Content */}
      <div className="pdf-content" style={{ padding: '1cm' }}>
        {children}
      </div>
      
      {/* Final Page */}
      <div className="pdf-page final-page" style={{ 
        pageBreakBefore: 'always',
        padding: '2cm',
        display: 'flex',
        flexDirection: 'column',
        height: '297mm'
      }}>
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          {reportType === 'agency' ? (
            <>
              {logoUrl && (
                <img 
                  src={logoUrl} 
                  alt={companyName} 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '80px',
                    marginBottom: '1cm'
                  }}
                />
              )}
              <h2 style={{ 
                fontSize: '18pt',
                fontWeight: 'bold',
                marginBottom: '1cm'
              }}>
                {companyName}
              </h2>
            </>
          ) : agentData && (
            <>
              {agentData.photoUrl && (
                <div style={{ 
                  width: '150px',
                  height: '150px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginBottom: '1cm',
                  border: '1px solid #ddd'
                }}>
                  <img 
                    src={agentData.photoUrl} 
                    alt={agentData.name}
                    style={{ 
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
              <h2 style={{ 
                fontSize: '18pt',
                fontWeight: 'bold',
                marginBottom: '0.5cm'
              }}>
                {agentData.name}
              </h2>
              <p style={{ 
                fontSize: '12pt',
                color: '#444'
              }}>
                Sales Agent
              </p>
            </>
          )}
          
          <div style={{ 
            marginTop: '2cm',
            padding: '1cm',
            border: '1px solid #ddd',
            maxWidth: '80%',
            borderRadius: '4px'
          }}>
            <p style={{ 
              fontSize: '12pt',
              fontStyle: 'italic',
              lineHeight: 1.5,
              color: '#444',
              textAlign: 'left'
            }}>
              Thank you for reviewing this report. For more detailed information or to discuss these results further, please don't hesitate to contact us.
            </p>
          </div>
        </div>
        
        <div style={{ 
          marginTop: 'auto',
          textAlign: 'center',
          borderTop: '1px solid #ddd',
          paddingTop: '1cm',
          fontSize: '10pt',
          color: '#777'
        }}>
          <p>{companyName} • {new Date().getFullYear()}</p>
          <p>Confidential Report</p>
        </div>
      </div>
    </div>
  );
}
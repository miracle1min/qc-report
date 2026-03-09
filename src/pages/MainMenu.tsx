import React from 'react';
import { ClipboardList, Flame, Thermometer, TestTubes, PackageX, ThermometerSnowflake, ChevronRight } from 'lucide-react';
import { FormType } from '../types';

interface Props {
  onOpenForm: (form: FormType) => void;
}

const MENU_ITEMS: { type: FormType; icon: React.ReactNode; title: string; subtitle: string; gradient: string; accentColor: string }[] = [
  {
    type: 'sortir_bawang',
    icon: <ClipboardList size={26} strokeWidth={1.8} />,
    title: 'Report Sortir',
    subtitle: 'Bawang Goreng',
    gradient: 'linear-gradient(135deg, rgba(0,247,255,0.12) 0%, rgba(0,247,255,0.02) 100%)',
    accentColor: 'rgba(0,247,255,0.6)',
  },
  {
    type: 'cabe_giling',
    icon: <Flame size={26} strokeWidth={1.8} />,
    title: 'Report Cabe',
    subtitle: 'Cabe Giling',
    gradient: 'linear-gradient(135deg, rgba(255,43,214,0.12) 0%, rgba(255,43,214,0.02) 100%)',
    accentColor: 'rgba(255,43,214,0.6)',
  },
  {
    type: 'suhu_equipment',
    icon: <Thermometer size={26} strokeWidth={1.8} />,
    title: 'Suhu Equipment',
    subtitle: 'All Equipments (°C)',
    gradient: 'linear-gradient(135deg, rgba(255,170,0,0.12) 0%, rgba(255,170,0,0.02) 100%)',
    accentColor: 'rgba(255,170,0,0.6)',
  },
  {
    type: 'tester_bahan',
    icon: <TestTubes size={26} strokeWidth={1.8} />,
    title: 'Tester Bahan',
    subtitle: 'Produk Sisa Semalam',
    gradient: 'linear-gradient(135deg, rgba(0,255,136,0.12) 0%, rgba(0,255,136,0.02) 100%)',
    accentColor: 'rgba(0,255,136,0.6)',
  },
  {
    type: 'return_barang',
    icon: <PackageX size={26} strokeWidth={1.8} />,
    title: 'Form Return',
    subtitle: 'Return Barang',
    gradient: 'linear-gradient(135deg, rgba(255,100,50,0.12) 0%, rgba(255,100,50,0.02) 100%)',
    accentColor: 'rgba(255,100,50,0.6)',
  },
  {
    type: 'suhu_datalogger',
    icon: <ThermometerSnowflake size={26} strokeWidth={1.8} />,
    title: 'Suhu Data Logger',
    subtitle: 'Chiller, Freezer & Cold Storage',
    gradient: 'linear-gradient(135deg, rgba(100,180,255,0.12) 0%, rgba(100,180,255,0.02) 100%)',
    accentColor: 'rgba(100,180,255,0.6)',
  },
];

export const MainMenu: React.FC<Props> = ({ onOpenForm }) => {
  return (
    <div style={{ padding: '16px 16px 20px' }}>
      {/* ── Section Label ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
        paddingLeft: 2,
      }}>
        <div style={{
          width: 3,
          height: 16,
          borderRadius: 2,
          background: 'linear-gradient(180deg, #00f7ff, #ff2bd6)',
        }} />
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Pilih Report
        </span>
      </div>

      {/* ── Menu Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        {MENU_ITEMS.map((item, index) => {
          // Last item (odd count) spans full width
          const isLastOdd = MENU_ITEMS.length % 2 === 1 && index === MENU_ITEMS.length - 1;
          return (
            <div
              key={item.type}
              className="menu-card-v2"
              onClick={() => onOpenForm(item.type)}
              style={{
                background: item.gradient,
                borderRadius: 16,
                padding: '20px 16px 18px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${item.accentColor.replace('0.6', '0.12')}`,
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                minHeight: 130,
                ...(isLastOdd ? { gridColumn: '1 / -1' } : {}),
              }}
            >
              {/* Top glow dot */}
              <div style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 60,
                height: 60,
                background: item.accentColor.replace('0.6', '0.15'),
                borderRadius: '50%',
                filter: 'blur(20px)',
                pointerEvents: 'none',
              }} />

              {/* Icon container */}
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: item.accentColor.replace('0.6', '0.1'),
                border: `1px solid ${item.accentColor.replace('0.6', '0.2')}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
                color: item.accentColor.replace('0.6', '1'),
              }}>
                {item.icon}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.92)',
                  marginBottom: 3,
                  lineHeight: 1.3,
                }}>
                  {item.title}
                </div>
                <div style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.4)',
                  fontWeight: 500,
                  lineHeight: 1.3,
                }}>
                  {item.subtitle}
                </div>
              </div>

              {/* Arrow indicator */}
              <div style={{
                position: 'absolute',
                bottom: 14,
                right: 14,
                color: item.accentColor.replace('0.6', '0.35'),
              }}>
                <ChevronRight size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Footer hint ── */}
      <div style={{
        textAlign: 'center',
        marginTop: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}>
        <div style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'rgba(0,247,255,0.3)',
        }} />
        <p style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.25)',
          margin: 0,
          fontWeight: 500,
        }}>
          Tap card untuk generate report
        </p>
        <div style={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: 'rgba(255,43,214,0.3)',
        }} />
      </div>
    </div>
  );
};

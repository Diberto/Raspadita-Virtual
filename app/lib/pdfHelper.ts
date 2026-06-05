import { jsPDF } from 'jspdf';

export function exportCouponToPDF(coupon: any, shopName: string, shopDescription: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [100, 150] // Custom ticket format
  });

  // Background and borders
  doc.setFillColor(18, 18, 20); // Dark elegant theme matching app
  doc.rect(0, 0, 100, 150, 'F');

  // Inner border
  doc.setDrawColor(251, 191, 36); // Gold / Accent color
  doc.setLineWidth(1);
  doc.rect(4, 4, 92, 142, 'D');

  // Scissors cutting guide dashed line at the top
  doc.setDrawColor(88, 88, 91);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(8, 12, 92, 12);
  doc.setLineDashPattern([], 0); // Reset

  // Scissors text symbol
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(161, 161, 170);
  doc.text('✂️ CORTE AQUÍ', 50, 10, { align: 'center' });

  // Shop Name
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(shopName.toUpperCase(), 50, 24, { align: 'center' });

  // Shop Desc
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(161, 161, 170);
  const descLines = doc.splitTextToSize(shopDescription, 80);
  doc.text(descLines, 50, 29, { align: 'center' });

  // Divider
  doc.setDrawColor(45, 45, 48);
  doc.line(15, 38, 85, 38);

  // Big Badge Header
  doc.setFillColor(251, 191, 36);
  doc.rect(15, 43, 70, 10, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('👑 CUPÓN OFICIAL DE PREMIO', 50, 49, { align: 'center' });

  // Prize section
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(161, 161, 170);
  doc.text('PREMIO OBTENIDO:', 15, 63);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  const prizeLines = doc.splitTextToSize(coupon.prizeName, 70);
  doc.text(prizeLines, 15, 69);

  // Code Section Card
  doc.setFillColor(25, 25, 28);
  doc.rect(15, 78, 70, 18, 'F');
  doc.setDrawColor(63, 63, 70);
  doc.rect(15, 78, 70, 18, 'D');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(251, 191, 36);
  doc.text('CÓDIGO DE VALIDACIÓN', 50, 83, { align: 'center' });

  doc.setFont('Courier', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(coupon.code, 50, 91, { align: 'center' });

  // Details
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(161, 161, 170);
  doc.text('PARTICIPANTE:', 15, 107);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(coupon.userName || 'Invitado', 42, 107);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(161, 161, 170);
  doc.text('VENCIMIENTO:', 15, 113);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(239, 68, 68); // Soft red
  doc.text(coupon.expiryDate || 'No expira', 42, 113);

  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(161, 161, 170);
  doc.text('ESTADO:', 15, 119);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(coupon.status === 'canjeado' ? 74 : 251, coupon.status === 'canjeado' ? 222 : 191, coupon.status === 'canjeado' ? 128 : 36); // Green or yellow
  doc.text(coupon.status.toUpperCase(), 42, 119);

  // Instruction footer
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(161, 161, 170);
  doc.text('Presentá este ticket impreso o digital en caja.', 50, 134, { align: 'center' });
  doc.text('Válido únicamente para canjes en local físico.', 50, 138, { align: 'center' });

  // Hash/Stamp
  doc.setFont('Courier', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(88, 88, 91);
  doc.text(`TICKET-ID: ${coupon.id} | VER: 2.0`, 50, 143, { align: 'center' });

  doc.save(`cupon_${coupon.code}.pdf`);
}

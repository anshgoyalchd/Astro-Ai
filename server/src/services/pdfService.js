import PDFDocument from 'pdfkit';

export async function renderReportPdf({ user, chat }) {
  return new Promise((resolve, reject) => {
    const report = chat.report || {};
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(24).text(report.title || 'AstroAI Celestial Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(report.subtitle || `Prepared for ${user.astrologyData?.fullName || user.name}`, { align: 'center' });
    doc.moveDown();

    const sections = [
      ['Overview', report.overview],
      ['Core Personality', report.corePersonality?.summary],
      ['Love & Connection', report.loveConnection?.summary],
      ['Career & Abundance', report.careerAbundance?.summary],
      ['Health & Ritual', `${report.healthRitual?.summary || ''}\n${(report.healthRitual?.rituals || []).map((item) => `• ${item}`).join('\n')}`]
    ];

    sections.forEach(([title, body]) => {
      doc.moveDown();
      doc.fontSize(16).text(title, { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(11).text(body || '');
    });

    doc.moveDown();
    doc.fontSize(16).text('Celestial Timeline', { underline: true });
    (report.celestialTimeline || []).forEach((entry) => {
      doc.moveDown(0.4);
      doc.fontSize(12).text(`${entry.date} - ${entry.title}`);
      doc.fontSize(11).text(`${entry.description} (${entry.energy})`);
    });

    doc.moveDown();
    doc.fontSize(12).text(report.closingQuote || '', { align: 'center', italic: true });
    doc.end();
  });
}

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType } from 'docx';
import { saveAs } from 'file-saver';

// Инициализация шрифтов для pdfmake
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;
pdfMake.fonts = {
  Roboto: {
    normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
    italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf',
  },
};

// Отчет по отзывам в PDF
export const generateReviewsPDF = (reviews) => {
  const tableBody = [
    [
      { text: '№', bold: true, fontSize: 9, fillColor: '#0d6efd', color: 'white' },
      { text: 'Автор', bold: true, fontSize: 9, fillColor: '#0d6efd', color: 'white' },
      { text: 'Фрилансер', bold: true, fontSize: 9, fillColor: '#0d6efd', color: 'white' },
      { text: 'Оценка', bold: true, fontSize: 9, fillColor: '#0d6efd', color: 'white' },
      { text: 'Текст', bold: true, fontSize: 9, fillColor: '#0d6efd', color: 'white' },
      { text: 'Статус', bold: true, fontSize: 9, fillColor: '#0d6efd', color: 'white' },
      { text: 'Дата', bold: true, fontSize: 9, fillColor: '#0d6efd', color: 'white' },
    ],
    ...reviews.map((r, i) => [
      { text: String(i + 1), fontSize: 8 },
      { text: r.author, fontSize: 8 },
      { text: r.freelancer, fontSize: 8 },
      { text: r.rating + '/5', fontSize: 8 },
      { text: r.text.length > 60 ? r.text.substring(0, 60) + '...' : r.text, fontSize: 8 },
      { text: r.status === 'blocked' ? 'Заблокирован' : 'Активен', fontSize: 8 },
      { text: new Date(r.createdAt).toLocaleDateString('ru-RU'), fontSize: 8 },
    ]),
  ];

  const docDefinition = {
    content: [
      { text: 'Отчет по отзывам', style: 'header' },
      { text: `Дата: ${new Date().toLocaleDateString('ru-RU')}`, fontSize: 10, margin: [0, 5, 0, 2] },
      { text: `Всего отзывов: ${reviews.length}`, fontSize: 10, margin: [0, 0, 0, 10] },
      {
        table: {
          headerRows: 1,
          widths: ['auto', 60, 60, 40, 140, 60, 60],
          body: tableBody,
        },
        layout: {
          fillColor: (rowIndex) => rowIndex % 2 === 0 ? '#f5f5f5' : null,
        },
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 10],
      },
    },
    defaultStyle: {
      font: 'Roboto',
    },
  };

  pdfMake.createPdf(docDefinition).download(`Отчет_по_отзывам_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Отчет по категориям в DOCX
export const generateCategoriesDOCX = async (categories) => {
  const rows = [
    new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'ID', bold: true, size: 20 })] })], width: { size: 10, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Название', bold: true, size: 20 })] })], width: { size: 25, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Описание', bold: true, size: 20 })] })], width: { size: 45, type: WidthType.PERCENTAGE } }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Услуг', bold: true, size: 20 })] })], width: { size: 20, type: WidthType.PERCENTAGE } }),
      ],
    }),
    ...categories.map(c =>
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(String(c.id))] }),
          new TableCell({ children: [new Paragraph(c.name)] }),
          new TableCell({ children: [new Paragraph(c.description || '—')] }),
          new TableCell({ children: [new Paragraph(String(c.servicesCount || 0))] }),
        ],
      })
    ),
  ];

  const table = new Table({
    rows,
    width: { size: 100, type: WidthType.PERCENTAGE },
  });

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: 'Отчет по категориям услуг', heading: 'Heading1', spacing: { after: 200 } }),
        new Paragraph({ text: `Дата: ${new Date().toLocaleDateString('ru-RU')}`, spacing: { after: 100 } }),
        new Paragraph({ text: `Всего категорий: ${categories.length}`, spacing: { after: 200 } }),
        table,
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Отчет_по_категориям_${new Date().toISOString().split('T')[0]}.docx`);
};
import React, { useMemo } from 'react';
import './Purchases.css';
import downloadIcon from '../assets/icons/icons8-download-24.png';

const Purchases = () => {
  const order = useMemo(() => {
    try {
      const raw = localStorage.getItem('lastOrder');
      return raw ? JSON.parse(raw) : { items: [], total: 0, delivery: false, date: new Date().toISOString() };
    } catch {
      return { items: [], total: 0, delivery: false, date: new Date().toISOString() };
    }
  }, []);

  const topTwo = order.items.slice(0, 2);

  const formatThousandsDots = (num) => {
    const n = Math.round(Number(num || 0));
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });

  const downloadPdf = async () => {
    try {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        await loadScript('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js');
      }
      if (!window.jspdf || !window.jspdf.jsPDF) throw new Error('jsPDF not loaded');
      if (!window.jspdfAutoTable) {
        await loadScript('https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.1/dist/jspdf.plugin.autotable.min.js');
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');

      const dateStr = new Date(order.date).toLocaleString('fr-FR');
      const modeStr = order.delivery ? 'Livraison' : 'Je passe chercher';
      const itemsRows = order.items.map(it => ({
        name: it.product_name,
        price: Number(it.price || 0),
        qty: Number(it.quantity || 0)
      }));
      if (order.delivery) {
        itemsRows.push({ name: 'Frais de livraison', price: 50000, qty: 1 });
      }
      const body = itemsRows.map(it => [
        it.name,
        it.qty,
        `${formatThousandsDots(it.price)} GNF`
      ]);

      doc.setFontSize(14);
      doc.text('Pièces Auto Market - Récapitulatif Achat', 16, 16);
      doc.setFontSize(11);
      doc.text(`Date: ${dateStr}`, 16, 24);
      doc.text(`Mode: ${modeStr}`, 16, 30);

      doc.autoTable({
        head: [['Nom de la pièce', 'Quantité totale', 'Prix unitaire']],
        body,
        startY: 36,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [26, 26, 26], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { halign: 'center', cellWidth: 25 },
          2: { halign: 'right', cellWidth: 40 }
        }
      });

      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 36;
      const totalStr = `${formatThousandsDots(order.total || 0)} GNF`;
      doc.setFontSize(12);
      doc.text(`Total facture: ${totalStr}`, 195, finalY + 8, { align: 'right' });

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        const w = window.open(url, '_blank');
        if (!w) {
          const a = document.createElement('a');
          a.href = url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.download = 'achat.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else {
        doc.save('achat.pdf');
      }
    } catch (e) {
      const dateStr = new Date(order.date).toLocaleString('fr-FR');
      const modeStr = order.delivery ? 'Livraison' : 'Je passe chercher';
      const itemsRows = order.items.map(it => ({
        name: it.product_name,
        price: Number(it.price || 0),
        qty: Number(it.quantity || 0)
      }));
      if (order.delivery) {
        itemsRows.push({ name: 'Frais de livraison', price: 50000, qty: 1 });
      }
      const rowsHtml = itemsRows.map(it => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${it.name}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${it.qty}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">${formatThousandsDots(it.price)} GNF</td>
        </tr>
      `).join('');
      const totalStr = `${formatThousandsDots(order.total || 0)} GNF`;
      const html = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <title>Récapitulatif Achat</title>
          <style>
            @page { margin: 16mm; }
            body { font-family: Arial, Helvetica, sans-serif; }
            h2 { margin: 0 0 8px 0; }
            .meta { margin-bottom: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; border: 1px solid #ddd; }
            th { text-align: left; }
            td:nth-child(2) { text-align: center; }
            td:nth-child(3) { text-align: right; }
            .total { margin-top: 16px; font-weight: bold; text-align: right; }
          </style>
        </head>
        <body>
          <h2>Pièces Auto Market - Récapitulatif Achat</h2>
          <div class="meta">Date: ${dateStr}</div>
          <div class="meta">Mode: ${modeStr}</div>
          <table>
            <thead>
              <tr>
                <th>Nom de la pièce</th>
                <th>Quantité totale</th>
                <th>Prix unitaire</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="total">Total facture: ${totalStr}</div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 250);
            };
          </script>
        </body>
        </html>
      `;
      const w = window.open('', '_blank');
      if (w) {
        w.document.open();
        w.document.write(html);
        w.document.close();
      }
    }
  };

  return (
    <div className="purchases-container">
      <h1>Mes achats</h1>
      <div className="stacked-list">
        <div className="purchase-card">
          <button className="pdf-btn" onClick={downloadPdf}>
            <img src={downloadIcon} alt="Télécharger PDF" />
          </button>
          <div className="purchase-info">
            <div className="purchase-date">{new Date(order.date).toLocaleDateString()}</div>
            <div className="purchase-total">Total: {order.total} GNF</div>
            <div className="purchase-items">
              {topTwo.map((it, i) => (
                <span key={i} className="item-chip">{it.product_name}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchases;

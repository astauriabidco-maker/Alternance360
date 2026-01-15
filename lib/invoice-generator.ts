
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface InvoiceData {
    invoiceNumber: string
    date: Date
    tenantName: string
    tenantAddress?: string
    amount: number
    planName: string
}

export const generateInvoicePDF = (data: InvoiceData) => {
    const doc = new jsPDF()
    const primaryColor = '#4f46e5'

    // Header Background
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 0, 210, 40, 'F')

    // Logo / Brand
    doc.setFontSize(24)
    doc.setTextColor(primaryColor)
    doc.setFont('helvetica', 'bold')
    doc.text("Alternance 360", 15, 25)

    doc.setFontSize(10)
    doc.setTextColor(150)
    doc.setFont('helvetica', 'normal')
    doc.text("Plateforme de Gestion CFA & Formation", 15, 32)

    // Invoice Details Box
    doc.setTextColor(50)
    doc.setFontSize(32)
    doc.setFont('helvetica', 'bold')
    doc.text("FACTURE", 140, 25, { align: 'right' })

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`#${data.invoiceNumber}`, 140, 32, { align: 'right' })

    // Divider
    doc.setDrawColor(240)
    doc.line(15, 45, 195, 45)

    // Bill To
    doc.setFontSize(10)
    doc.setTextColor(150)
    doc.text("FACTURÉ À", 15, 60)

    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.setFont('helvetica', 'bold')
    doc.text(data.tenantName, 15, 68)

    if (data.tenantAddress) {
        doc.setFontSize(10)
        doc.setTextColor(100)
        doc.setFont('helvetica', 'normal')
        const splitAddr = doc.splitTextToSize(data.tenantAddress, 80)
        doc.text(splitAddr, 15, 75)
    }

    // Bill From
    doc.setFontSize(10)
    doc.setTextColor(150)
    doc.text("ÉMIS PAR", 120, 60)

    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.setFont('helvetica', 'bold')
    doc.text("Alternance 360 Inc.", 120, 68)
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.setFont('helvetica', 'normal')
    doc.text("123 Avenue de la République\n75011 Paris\nFrance", 120, 75)


    // Line Items
    autoTable(doc, {
        startY: 100,
        head: [['Description', 'Période', 'Montant HT']],
        body: [
            [
                `Abonnement ${data.planName}`,
                format(data.date, 'MMMM yyyy', { locale: fr }),
                `${data.amount.toFixed(2)} €`
            ]
        ],
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: {
            0: { cellWidth: 100 },
            2: { halign: 'right' }
        }
    })

    // Totals
    const finalY = (doc as any).lastAutoTable.finalY + 10

    doc.setFontSize(10)
    doc.text("Sous-total :", 140, finalY)
    doc.text(`${data.amount.toFixed(2)} €`, 195, finalY, { align: 'right' })

    doc.text("TVA (20%) :", 140, finalY + 7)
    doc.text(`${(data.amount * 0.2).toFixed(2)} €`, 195, finalY + 7, { align: 'right' })

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text("TOTAL TTC :", 140, finalY + 18)
    doc.setTextColor(primaryColor)
    doc.text(`${(data.amount * 1.2).toFixed(2)} €`, 195, finalY + 18, { align: 'right' })


    // Footer
    doc.setTextColor(150)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text("Merci de votre confiance.", 105, 280, { align: 'center' })
    doc.text("Alternance 360 Inc. - SIRET 123 456 789 00012", 105, 285, { align: 'center' })

    doc.save(`Facture-${data.invoiceNumber}.pdf`)
}

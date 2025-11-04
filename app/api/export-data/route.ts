import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, exportType, period, date } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId requis" }, { status: 400 });
    }

    // TODO: Récupérer les données depuis Supabase
    // Pour l'instant, on retourne un message
    
    const csvData = `Date,Description,Montant,Type
${date},Exemple de simulation,1000,Simulation URSSAF
${date},Exemple de facture,500,Facture`;

    const blob = new Blob([csvData], { type: "text/csv" });
    
    return new NextResponse(blob, {
      headers: {
        "Content-Type": exportType === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv",
        "Content-Disposition": `attachment; filename=comptalyze_export_${period}_${date}.${exportType === "excel" ? "xlsx" : "csv"}`,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de l'export:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export" },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";
import { verifyUserOwnership } from '@/lib/auth';
import { exportDataSchema, validateAndParse } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Valider les données d'entrée
    const validation = validateAndParse(exportDataSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { userId, exportType, period, date } = validation.data;

    // Vérifier que l'utilisateur authentifié correspond au userId fourni
    const authResult = await verifyUserOwnership(req, userId);
    if (!authResult.isAuthenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
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
    const { handleInternalError } = await import('@/lib/error-handler');
    return handleInternalError(error);
  }
}


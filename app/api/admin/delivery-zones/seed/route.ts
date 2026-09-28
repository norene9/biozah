
import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/firebase/server";
import { createDeliveryZone, getDeliveryZones } from "@/lib/firebase/delivery";

const WILAYAS: { code: string; name: string }[] = [
  // Original 58 (Loi 19-12, Dec 2019)
  { code: "01", name: "Adrar" }, { code: "02", name: "Chlef" }, { code: "03", name: "Laghouat" },
  { code: "04", name: "Oum El Bouaghi" }, { code: "05", name: "Batna" }, { code: "06", name: "Béjaïa" },
  { code: "07", name: "Biskra" }, { code: "08", name: "Béchar" }, { code: "09", name: "Blida" },
  { code: "10", name: "Bouira" }, { code: "11", name: "Tamanrasset" }, { code: "12", name: "Tébessa" },
  { code: "13", name: "Tlemcen" }, { code: "14", name: "Tiaret" }, { code: "15", name: "Tizi Ouzou" },
  { code: "16", name: "Alger" }, { code: "17", name: "Djelfa" }, { code: "18", name: "Jijel" },
  { code: "19", name: "Sétif" }, { code: "20", name: "Saïda" }, { code: "21", name: "Skikda" },
  { code: "22", name: "Sidi Bel Abbès" }, { code: "23", name: "Annaba" }, { code: "24", name: "Guelma" },
  { code: "25", name: "Constantine" }, { code: "26", name: "Médéa" }, { code: "27", name: "Mostaganem" },
  { code: "28", name: "M'Sila" }, { code: "29", name: "Mascara" }, { code: "30", name: "Ouargla" },
  { code: "31", name: "Oran" }, { code: "32", name: "El Bayadh" }, { code: "33", name: "Illizi" },
  { code: "34", name: "Bordj Bou Arréridj" }, { code: "35", name: "Boumerdès" }, { code: "36", name: "El Tarf" },
  { code: "37", name: "Tindouf" }, { code: "38", name: "Tissemsilt" }, { code: "39", name: "El Oued" },
  { code: "40", name: "Khenchela" }, { code: "41", name: "Souk Ahras" }, { code: "42", name: "Tipaza" },
  { code: "43", name: "Mila" }, { code: "44", name: "Aïn Defla" }, { code: "45", name: "Naâma" },
  { code: "46", name: "Aïn Témouchent" }, { code: "47", name: "Ghardaïa" }, { code: "48", name: "Relizane" },
  { code: "49", name: "Timimoun" }, { code: "50", name: "Bordj Badji Mokhtar" }, { code: "51", name: "Ouled Djellal" },
  { code: "52", name: "Béni Abbès" }, { code: "53", name: "In Salah" }, { code: "54", name: "In Guezzam" },
  { code: "55", name: "Touggourt" }, { code: "56", name: "Djanet" }, { code: "57", name: "El M'Ghair" },
  { code: "58", name: "El Meniaa" },

  // New 11 (Loi 26-06, 4 April 2026) — mother wilaya noted for reference when pricing
  { code: "59", name: "Aflou" },               // was part of Laghouat (03)
  { code: "60", name: "Barika" },               // was part of Batna (05)
  { code: "61", name: "El Kantara" },           // was part of Biskra (07)
  { code: "62", name: "Bir El Ater" },          // was part of Tébessa (12)
  { code: "63", name: "El Aricha" },            // was part of Tlemcen (13)
  { code: "64", name: "Ksar Chellala" },        // was part of Tiaret (14)
  { code: "65", name: "Aïn Oussara" },          // was part of Djelfa (17)
  { code: "66", name: "Messaad" },              // was part of Djelfa (17)
  { code: "67", name: "Ksar El Boukhari" },     // was part of Médéa (26)
  { code: "68", name: "Bou Saâda" },            // was part of M'Sila (28)
  { code: "69", name: "El Abiodh Sidi Cheikh" }, // was part of El Bayadh (32)
];

export async function POST() {
  if (!(await getCurrentAdmin())) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const existing = new Set((await getDeliveryZones()).map((z) => z.wilayaCode));
    const toCreate = WILAYAS.filter((w) => !existing.has(w.code));
    await Promise.all(
      toCreate.map((w) =>
        createDeliveryZone({
          wilayaCode: w.code,
          wilayaName: w.name,
          homeDeliveryPrice: 0,
          deskDeliveryPrice: 0,
          active: true,
        }),
      ),
    );
    return NextResponse.json({ ok: true, created: toCreate.length, total: WILAYAS.length });
  } catch {
    return NextResponse.json({ error: "Unable to seed delivery zones." }, { status: 502 });
  }
}


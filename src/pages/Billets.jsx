// pages/Billets.jsx
import React, { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const Billets = () => {
  const [billets, setBillets] = useState([
    {
      id: 1,
      client: "Moussa Traoré",
      trajet: "Bamako → Kayes",
      date: "2025-09-25 08:00",
      statut: "Valide",
      code: "BILLET-001",
    },
    {
      id: 2,
      client: "Awa Diallo",
      trajet: "Bamako → Sikasso",
      date: "2025-09-26 10:00",
      statut: "Annulé",
      code: "BILLET-002",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    client: "",
    trajet: "",
    date: "",
    statut: "Valide",
    code: "",
  });

  const openModal = (billet = null) => {
    if (billet) {
      setEditing(billet.id);
      setForm(billet);
    } else {
      setEditing(null);
      setForm({
        client: "",
        trajet: "",
        date: "",
        statut: "Valide",
        code: "BILLET-" + Math.floor(Math.random() * 10000),
      });
    }
    setShowModal(true);
  };

  const saveBillet = () => {
    if (editing) {
      setBillets(billets.map((b) => (b.id === editing ? form : b)));
    } else {
      setBillets([...billets, { ...form, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const deleteBillet = (id) => {
    setBillets(billets.filter((b) => b.id !== id));
  };

  const downloadPDF = (billet) => {
    const content = `
      === Billet de Transport ===
      Nom client: ${billet.client}
      Trajet: ${billet.trajet}
      Date: ${billet.date}
      Statut: ${billet.statut}
      Code: ${billet.code}
    `;
    const blob = new Blob([content], { type: "application/pdf" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${billet.code}.pdf`;
    link.click();
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">
          Gestion des billets
        </h2>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Nouveau billet
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm">
              <th className="p-3">Client</th>
              <th className="p-3">Trajet</th>
              <th className="p-3">Date</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Code</th>
              <th className="p-3">QR</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {billets.map((b) => (
              <tr key={b.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{b.client}</td>
                <td className="p-3">{b.trajet}</td>
                <td className="p-3">{b.date}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      b.statut === "Valide"
                        ? "bg-green-100 text-green-600"
                        : b.statut === "Annulé"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {b.statut}
                  </span>
                </td>
                <td className="p-3 font-mono">{b.code}</td>
                <td className="p-3">
                  <QRCodeCanvas value={b.code} size={40} />
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => downloadPDF(b)}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Télécharger
                  </button>
                  <button
                    onClick={() => openModal(b)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => deleteBillet(b.id)}
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">
              {editing ? "Modifier billet" : "Nouveau billet"}
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nom du client"
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="text"
                placeholder="Trajet (ex: Bamako → Kayes)"
                value={form.trajet}
                onChange={(e) => setForm({ ...form, trajet: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
              <select
                value={form.statut}
                onChange={(e) => setForm({ ...form, statut: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Valide">Valide</option>
                <option value="Annulé">Annulé</option>
                <option value="Expiré">Expiré</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={saveBillet}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billets;

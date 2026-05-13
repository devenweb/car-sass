"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// New Components
import { FleetHeader } from "@/components/fleet/FleetHeader";
import { FleetStats } from "@/components/fleet/FleetStats";
import { FleetTable } from "@/components/fleet/FleetTable";
import { UnitModal } from "@/components/fleet/UnitModal";
import { MaintenanceModal } from "@/components/fleet/MaintenanceModal";
import { HistoryModal } from "@/components/fleet/HistoryModal";

export default function FleetPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<any>(null);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [selectedUnitForMaint, setSelectedUnitForMaint] = useState<any>(null);
  const [selectedUnitHistory, setSelectedUnitHistory] = useState<any>(null);
  
  const [uploading, setUploading] = useState(false);
  const [maintDescription, setMaintDescription] = useState("");
  const [isSavingMaint, setIsSavingMaint] = useState(false);

  useEffect(() => { fetchFleet(); }, []);

  const fetchFleet = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicle_templates')
        .select('*, units:vehicle_units(*)')
        .order('brand', { ascending: true });
      if (error) throw error;
      setTemplates(data || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) newExpanded.delete(id);
    else newExpanded.add(id);
    setExpandedRows(newExpanded);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Are you sure? This will delete the template and all associated vehicle units. If there are existing rentals for these vehicles, deletion will be blocked.")) return;
    
    const { error: unitError } = await supabase.from('vehicle_units').delete().eq('vehicle_template_id', id);
    
    if (unitError) {
      if (unitError.code === '23503') {
        alert("CANNOT DELETE: This model has units linked to existing rental records. Please set the model to 'Inactive' instead to remove it from the public catalog.");
        return;
      }
      console.error("Unit delete error:", unitError);
      alert("Error deleting units: " + unitError.message);
      return;
    }

    const { error } = await supabase.from('vehicle_templates').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') {
        alert("CANNOT DELETE: This model is referenced by other records (rentals or logs). Set to 'Inactive' to hide it.");
      } else {
        console.error("Delete error:", error);
        alert("Error deleting template: " + error.message);
      }
    } else {
      fetchFleet();
    }
  };

  const openUnitModal = (unit: any, templateId?: string) => {
    setEditingUnit(unit || {
      vehicle_template_id: templateId, plate_number: "",
      vin: "", color: "White", mileage: 0,
      availability_status: "available", internal_reference: ""
    });
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async () => {
    if (!editingUnit.plate_number) return;
    setUploading(true);
    
    const unitToSave = {
      id: editingUnit.id,
      vehicle_template_id: editingUnit.vehicle_template_id,
      plate_number: editingUnit.plate_number,
      vin: editingUnit.vin,
      color: editingUnit.color,
      mileage: editingUnit.mileage,
      availability_status: editingUnit.availability_status,
      daily_price: editingUnit.daily_price,
      internal_reference: editingUnit.internal_reference
    };
    
    const { error } = await supabase.from('vehicle_units').upsert(unitToSave);
    if (error) {
      console.error("Unit save error:", error);
      alert("Error saving unit: " + error.message);
    } else { 
      setIsUnitModalOpen(false); 
      fetchFleet(); 
    }
    setUploading(false);
  };

  const handleDeleteUnit = async (id: string) => {
    if (!confirm("Remove unit? This cannot be undone.")) return;
    const { error } = await supabase.from('vehicle_units').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') {
        alert("CANNOT DELETE: This unit is linked to rental history. Change its status to 'Maintenance' or 'Inactive' instead.");
      } else {
        alert("Error deleting unit: " + error.message);
      }
    } else fetchFleet();
  };

  const handleLogMaintenance = async () => {
    if (!maintDescription || !selectedUnitForMaint) return;
    setIsSavingMaint(true);
    try {
      const { error } = await supabase.from('vehicle_maintenance_records').insert({
        vehicle_unit_id: selectedUnitForMaint.id,
        maintenance_type: maintDescription,
        service_date: new Date().toISOString().split('T')[0],
        description: `Logged via Fleet Manager: ${maintDescription}`
      });

      if (error) throw error;
      setIsMaintModalOpen(false);
      fetchFleet();
    } catch (error: any) {
      console.error("Maintenance log error:", error);
      alert("Error logging maintenance: " + error.message);
    } finally {
      setIsSavingMaint(false);
    }
  };

  const showHistory = async (unit: any) => {
    const { data } = await supabase
      .from('rental_inspections')
      .select(`
        *,
        rentals (
          customers (name)
        )
      `)
      .eq('vehicle_unit_id', unit.id)
      .order('created_at', { ascending: false });
    
    if (data && data.length > 0) {
      setSelectedUnitHistory({
        unit,
        history: data
      });
    } else {
      alert("No history records found for this unit.");
    }
  };

  const filteredTemplates = templates.filter(t => 
    `${t.brand} ${t.model}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <FleetHeader 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
      />

      <FleetStats templates={templates} />

      <FleetTable 
        templates={filteredTemplates}
        loading={loading}
        expandedRows={expandedRows}
        toggleRow={toggleRow}
        onDeleteTemplate={handleDeleteTemplate}
        onAddUnit={(tid) => openUnitModal(null, tid)}
        onEditUnit={openUnitModal}
        onDeleteUnit={handleDeleteUnit}
        onMaintenance={(unit) => {
          setSelectedUnitForMaint(unit);
          setMaintDescription("");
          setIsMaintModalOpen(true);
        }}
        onShowHistory={showHistory}
      />

      <UnitModal 
        isOpen={isUnitModalOpen}
        onClose={() => setIsUnitModalOpen(false)}
        editingUnit={editingUnit}
        setEditingUnit={setEditingUnit}
        onSave={handleSaveUnit}
      />

      <MaintenanceModal 
        isOpen={isMaintModalOpen}
        onClose={() => setIsMaintModalOpen(false)}
        selectedUnit={selectedUnitForMaint}
        maintDescription={maintDescription}
        setMaintDescription={setMaintDescription}
        onSave={handleLogMaintenance}
        isSaving={isSavingMaint}
      />

      <HistoryModal 
        selectedUnitHistory={selectedUnitHistory}
        onClose={() => setSelectedUnitHistory(null)}
      />
    </div>
  );
}
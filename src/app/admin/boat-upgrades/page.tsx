
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Ship, 
  Edit2, 
  Loader2, 
  AlertCircle, 
  Save,
  Settings2,
  ChevronRight
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface BoatUpgradeRule {
  id: string;
  level: number;
  upgrade_cost: number;
  unlocks: string;
}

export default function BoatUpgradesPage() {
  const [rules, setRules] = useState<BoatUpgradeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<BoatUpgradeRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('boat_upgrade_rules')
        .select('*')
        .order('level', { ascending: true });

      if (fetchError) throw fetchError;
      setRules(data || []);
    } catch (err: any) {
      console.error('Error fetching boat rules:', err);
      setError(err.message || 'Failed to retrieve boat progression logic from the archive.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleEdit = (rule: BoatUpgradeRule) => {
    setEditingRule({ ...rule });
  };

  const handleSave = async () => {
    if (!editingRule) return;

    try {
      setIsSaving(true);
      const { error: updateError } = await supabase
        .from('boat_upgrade_rules')
        .update({
          upgrade_cost: editingRule.upgrade_cost,
          unlocks: editingRule.unlocks
        })
        .eq('id', editingRule.id);

      if (updateError) throw updateError;

      toast({
        title: "Vessel Logic Updated",
        description: `Upgrade parameters for Level ${editingRule.level} have been committed.`,
      });

      setEditingRule(null);
      fetchRules();
    } catch (err: any) {
      console.error('Error saving boat rule:', err);
      toast({
        variant: "destructive",
        title: "Calibration Failed",
        description: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateEditingField = (field: keyof BoatUpgradeRule, value: any) => {
    if (!editingRule) return;
    setEditingRule({ ...editingRule, [field]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground flex items-center gap-3">
            <Ship className="w-8 h-8 text-primary" />
            Vessel Progression
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Calibrate the resource costs and features unlocked by advancing player vessels.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="font-headline font-bold uppercase tracking-wider text-xs">Registry Error</AlertTitle>
          <AlertDescription className="font-body text-xs italic">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border border-border/60 bg-card/20 overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-xs font-headline uppercase tracking-widest text-muted-foreground animate-pulse">
              Retrieving Progression Nodes...
            </p>
          </div>
        ) : rules.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-center">
            <Ship className="w-10 h-10 text-muted-foreground/20" />
            <p className="font-headline text-lg font-medium text-muted-foreground">No progression rules cataloged</p>
            <p className="text-xs text-muted-foreground/60 font-body italic">Define vessel levels in the registry to manage player advancement.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="font-headline uppercase tracking-widest text-[10px] w-[100px]">Level</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Upgrade Cost</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Unlocks & Features</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id} className="border-border/40 hover:bg-primary/5 transition-colors group">
                  <TableCell className="font-headline font-bold text-lg text-primary">
                    Lvl {rule.level}
                  </TableCell>
                  <TableCell className="font-mono text-sm font-bold text-amber-500">
                    {rule.upgrade_cost > 0 ? `${rule.upgrade_cost.toLocaleString()} Sh` : '—'}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="font-body text-xs text-muted-foreground line-clamp-2 italic">
                      {rule.unlocks || 'No specific unlocks defined for this tier.'}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(rule)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2 hover:bg-primary hover:text-primary-foreground"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                      Calibrate
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!editingRule} onOpenChange={(open) => !open && setEditingRule(null)}>
        <DialogContent className="max-w-md bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-primary" />
              Level {editingRule?.level} Tuning
            </DialogTitle>
            <DialogDescription className="font-body text-xs italic">
              Adjust the advancement requirements and narrative unlocks for this vessel tier.
            </DialogDescription>
          </DialogHeader>

          {editingRule && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-headline tracking-widest text-muted-foreground">Upgrade Cost (Shells)</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={editingRule.upgrade_cost} 
                    onChange={(e) => updateEditingField('upgrade_cost', parseInt(e.target.value))}
                    className="bg-background/50 font-mono pr-12"
                  />
                  <div className="absolute right-3 top-2.5 text-[10px] font-headline text-muted-foreground/50">SH</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-headline tracking-widest text-muted-foreground">Unlocks & Features</Label>
                <Textarea 
                  value={editingRule.unlocks} 
                  onChange={(e) => updateEditingField('unlocks', e.target.value)}
                  placeholder="Describe what becomes accessible at this level..."
                  className="bg-background/50 font-body text-sm min-h-[120px]"
                />
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 flex gap-3 items-start">
                <Ship className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground font-body italic leading-relaxed">
                  Advancing to this level requires protagonists to expend the defined cost. Ensure the unlocks align with the narrative progression of the chronicles.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-border/40">
            <Button variant="outline" onClick={() => setEditingRule(null)} className="font-headline uppercase tracking-widest text-[10px]">
              Abort
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="font-headline uppercase tracking-widest text-[10px]">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Commit Logic
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

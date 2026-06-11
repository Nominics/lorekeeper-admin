
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Compass, 
  Edit2, 
  Loader2, 
  AlertCircle, 
  Save,
  Settings2
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
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
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

interface ExpeditionRule {
  id: string;
  expedition_name: string;
  duration_minutes: number;
  cards_reward_min: number;
  cards_reward_max: number;
  cowry_min: number;
  cowry_max: number;
  required_boat_level: number;
  cost_cowry: number;
  common_chance: number;
  rare_chance: number;
  epic_chance: number;
  legendary_chance: number;
  enabled: boolean;
}

export default function ExpeditionRulesPage() {
  const [rules, setRules] = useState<ExpeditionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRule, setEditingRule] = useState<ExpeditionRule | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('expedition_rules')
        .select('*')
        .order('required_boat_level', { ascending: true });

      if (fetchError) throw fetchError;
      setRules(data || []);
    } catch (err: any) {
      console.error('Error fetching rules:', err);
      setError(err.message || 'Failed to retrieve expedition logic from the archive.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleEdit = (rule: ExpeditionRule) => {
    setEditingRule({ ...rule });
  };

  const handleSave = async () => {
    if (!editingRule) return;

    try {
      setIsSaving(true);
      const { error: updateError } = await supabase
        .from('expedition_rules')
        .update(editingRule)
        .eq('id', editingRule.id);

      if (updateError) throw updateError;

      toast({
        title: "Logic Re-calibrated",
        description: `Expedition rules for "${editingRule.expedition_name}" have been updated.`,
      });

      setEditingRule(null);
      fetchRules();
    } catch (err: any) {
      console.error('Error saving rule:', err);
      toast({
        variant: "destructive",
        title: "Calibration Failed",
        description: err.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateEditingField = (field: keyof ExpeditionRule, value: any) => {
    if (!editingRule) return;
    setEditingRule({ ...editingRule, [field]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground flex items-center gap-3">
            <Compass className="w-8 h-8 text-primary" />
            Expedition Logic
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Configure the parameters and probabilities for deep-sea explorations.
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
              Synchronizing Logic...
            </p>
          </div>
        ) : rules.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center gap-2 text-center">
            <Settings2 className="w-10 h-10 text-muted-foreground/20" />
            <p className="font-headline text-lg font-medium text-muted-foreground">No expedition rules defined</p>
            <p className="text-xs text-muted-foreground/60 font-body italic">Initialize rules in the database to manage exploration logic.</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Name</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Time (min)</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Boat Lvl</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Cost</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px]">Reward Ranges</TableHead>
                <TableHead className="font-headline uppercase tracking-widest text-[10px] text-center">Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id} className="border-border/40 hover:bg-primary/5 transition-colors group">
                  <TableCell className="font-headline font-bold text-sm tracking-tight text-primary">
                    {rule.expedition_name}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{rule.duration_minutes}</TableCell>
                  <TableCell className="font-mono text-xs">Lvl {rule.required_boat_level}</TableCell>
                  <TableCell className="font-mono text-xs text-amber-500 font-bold">{rule.cost_cowry.toLocaleString()} Sh</TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    Cards: {rule.cards_reward_min}-{rule.cards_reward_max} | Shells: {rule.cowry_min}-{rule.cowry_max}
                  </TableCell>
                  <TableCell className="text-center">
                    {rule.enabled ? (
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/5 text-[9px]">ACTIVE</Badge>
                    ) : (
                      <Badge variant="outline" className="border-rose-500/50 text-rose-500 bg-rose-500/5 text-[9px]">DISABLED</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(rule)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2 hover:bg-primary hover:text-primary-foreground"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                      Adjust
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={!!editingRule} onOpenChange={(open) => !open && setEditingRule(null)}>
        <DialogContent className="max-w-2xl bg-card border-border shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl flex items-center gap-2">
              <Settings2 className="w-6 h-6 text-primary" />
              Calibrate: {editingRule?.expedition_name}
            </DialogTitle>
            <DialogDescription className="font-body text-xs italic">
              Modify the underlying probabilities and reward ranges for this exploration pathway.
            </DialogDescription>
          </DialogHeader>

          {editingRule && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <h4 className="text-[10px] font-headline uppercase tracking-[0.2em] text-primary border-b border-primary/20 pb-1">Core Metrics</h4>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-headline tracking-widest text-muted-foreground">Duration (Minutes)</Label>
                  <Input 
                    type="number" 
                    value={editingRule.duration_minutes} 
                    onChange={(e) => updateEditingField('duration_minutes', parseInt(e.target.value))}
                    className="bg-background/50 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-headline tracking-widest text-muted-foreground">Req. Boat Lvl</Label>
                    <Input 
                      type="number" 
                      value={editingRule.required_boat_level} 
                      onChange={(e) => updateEditingField('required_boat_level', parseInt(e.target.value))}
                      className="bg-background/50 font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-headline tracking-widest text-muted-foreground">Cost (Shells)</Label>
                    <Input 
                      type="number" 
                      value={editingRule.cost_cowry} 
                      onChange={(e) => updateEditingField('cost_cowry', parseInt(e.target.value))}
                      className="bg-background/50 font-mono"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-background/20">
                  <div className="space-y-0.5">
                    <Label className="text-xs uppercase font-headline tracking-wider">Status</Label>
                    <p className="text-[9px] text-muted-foreground font-body italic">Toggle visibility for players</p>
                  </div>
                  <Switch 
                    checked={editingRule.enabled} 
                    onCheckedChange={(val) => updateEditingField('enabled', val)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-headline uppercase tracking-[0.2em] text-primary border-b border-primary/20 pb-1">Reward Distribution</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-headline tracking-widest text-muted-foreground">Min Cards</Label>
                    <Input 
                      type="number" 
                      value={editingRule.cards_reward_min} 
                      onChange={(e) => updateEditingField('cards_reward_min', parseInt(e.target.value))}
                      className="bg-background/50 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-headline tracking-widest text-muted-foreground">Max Cards</Label>
                    <Input 
                      type="number" 
                      value={editingRule.cards_reward_max} 
                      onChange={(e) => updateEditingField('cards_reward_max', parseInt(e.target.value))}
                      className="bg-background/50 font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-headline tracking-widest text-muted-foreground">Min Shells</Label>
                    <Input 
                      type="number" 
                      value={editingRule.cowry_min} 
                      onChange={(e) => updateEditingField('cowry_min', parseInt(e.target.value))}
                      className="bg-background/50 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-headline tracking-widest text-muted-foreground">Max Shells</Label>
                    <Input 
                      type="number" 
                      value={editingRule.cowry_max} 
                      onChange={(e) => updateEditingField('cowry_max', parseInt(e.target.value))}
                      className="bg-background/50 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4 pt-4 border-t border-border/40">
                <h4 className="text-[10px] font-headline uppercase tracking-[0.2em] text-primary border-b border-primary/20 pb-1">Rarity Probabilities (0.0 - 1.0)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-headline tracking-widest text-slate-400">Common</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={editingRule.common_chance} 
                      onChange={(e) => updateEditingField('common_chance', parseFloat(e.target.value))}
                      className="bg-background/50 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-headline tracking-widest text-blue-400">Rare</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={editingRule.rare_chance} 
                      onChange={(e) => updateEditingField('rare_chance', parseFloat(e.target.value))}
                      className="bg-background/50 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-headline tracking-widest text-purple-400">Epic</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={editingRule.epic_chance} 
                      onChange={(e) => updateEditingField('epic_chance', parseFloat(e.target.value))}
                      className="bg-background/50 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-headline tracking-widest text-amber-500">Legendary</Label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={editingRule.legendary_chance} 
                      onChange={(e) => updateEditingField('legendary_chance', parseFloat(e.target.value))}
                      className="bg-background/50 font-mono text-xs"
                    />
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground font-body italic text-center pt-2">
                  Archival Note: Rarity probabilities should ideally sum to 1.0 for predictable discovery cycles.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-6 border-t border-border/40">
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

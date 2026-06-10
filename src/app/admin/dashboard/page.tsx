
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BookOpen, Users, Calendar, Activity, Zap, ShieldAlert } from 'lucide-react';

const stats = [
  { title: "Total Archives", value: "1,248", change: "+12", icon: BookOpen },
  { title: "Active Protagonists", value: "342", change: "+5", icon: Users },
  { title: "Pending Chronicles", value: "18", change: "-2", icon: Calendar },
  { title: "Registry Status", value: "Nominal", change: "Stable", icon: ShieldAlert },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-headline font-bold tracking-tight text-foreground">
          Registry Overview
        </h1>
        <p className="text-muted-foreground font-body">
          Current state of the digital archives and protagonist interactions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={stat.title} className="border-border/60 bg-card/50 hover:border-primary/40 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-headline uppercase tracking-widest text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-headline font-bold">{stat.value}</div>
              <p className="text-[10px] font-body text-muted-foreground mt-1">
                {stat.change.startsWith('+') || stat.change.startsWith('-') ? (
                  <span className={stat.change.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}>
                    {stat.change}
                  </span>
                ) : stat.change} from previous cycle
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/60 bg-card/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" strokeWidth={1.5} />
              <CardTitle className="font-headline text-lg">Recent Registry Activity</CardTitle>
            </div>
            <CardDescription className="font-body">Live stream of archival modifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="flex items-center gap-4 border-b border-border/30 pb-4 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-headline font-medium">New Archive Committed: <span className="text-primary italic">#AX-209{item}</span></p>
                    <p className="text-xs text-muted-foreground font-body">Commited by Archivist Delta • 1{item} minutes ago</p>
                  </div>
                  <Zap className="w-4 h-4 text-muted-foreground opacity-50" strokeWidth={1.5} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/30">
          <CardHeader>
            <CardTitle className="font-headline text-lg">System Health</CardTitle>
            <CardDescription className="font-body">Resource consumption</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-headline uppercase tracking-wider">
                <span>Memory Allocation</span>
                <span className="text-primary">64%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[64%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-headline uppercase tracking-wider">
                <span>Supabase JS Latency</span>
                <span className="text-primary">24ms</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[24%]" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-headline uppercase tracking-wider">
                <span>Encryption Entropy</span>
                <span className="text-primary">99.8%</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[99.8%]" />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border/40">
              <div className="p-4 rounded-sm bg-primary/5 border border-primary/20">
                <p className="text-[10px] font-headline uppercase tracking-widest text-primary mb-1">Notice</p>
                <p className="text-xs text-muted-foreground leading-relaxed font-body italic">
                  Maintenance scheduled for Chronos node at 04:00 Archive Time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

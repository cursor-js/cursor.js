'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Check, Copy, Eye, EyeOff, Gem, KeyRound, LogIn, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProPurchaseButton } from '@/components/app/pro-purchase-button';
import { authClient } from '@/lib/auth-client';
import { getProPurchaseHref, type LicensePlan } from '@/lib/pro-purchase';

export interface PendingVoiceRequest {
  id: string;
  text: string;
  speaker: string;
  language: string;
  requestedAt: string;
  status: 'pending' | 'generated' | 'deleted';
}

export interface GeneratedVoice {
  id: string;
  text: string;
  speaker: string;
  language: string;
  generatedAt: string | null;
  audioUrl: string;
}

export interface DashboardLicense {
  id: string;
  key: string;
  status: string;
  plan: string;
  lemonSqueezyCustomerId: string | null;
  lemonSqueezyOrderId: string | null;
  lemonSqueezySubscriptionId: string | null;
  lemonSqueezyVariantId: string | null;
  customerEmail: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

const planLabels = {
  pro_solo: 'Cursor.js Pro Solo',
  pro_team: 'Cursor.js Pro Team',
  gemini_tts_solo: 'Gemini TTS Solo',
  gemini_tts_team: 'Gemini TTS Team',
} as const satisfies Record<LicensePlan, string>;

function formatRequestDate(value: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatDashboardDate(value: string | null): string {
  if (!value) return 'Pending';

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

function isLicensePlan(value: string): value is LicensePlan {
  return value in planLabels;
}

function getPlanLabel(plan: string): string {
  return isLicensePlan(plan) ? planLabels[plan] : plan;
}

function isActive(license: DashboardLicense): boolean {
  return license.status === 'active';
}

function maskLicenseKey(value: string): string {
  if (value.length <= 12) return '••••••••';
  return `${value.slice(0, 6)}••••••••${value.slice(-4)}`;
}

function LicenseKeyField({ licenseKey }: { licenseKey: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="min-w-0 flex-1 overflow-x-auto rounded-md border bg-muted px-3 py-2 text-xs">
        {revealed ? licenseKey : maskLicenseKey(licenseKey)}
      </code>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setRevealed((current) => !current)}
        >
          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {revealed ? 'Hide' : 'Reveal'}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            void navigator.clipboard.writeText(licenseKey).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          <Copy className="h-4 w-4" />
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  );
}

interface GeminiTTSDashboardProps {
  checkoutSucceeded?: boolean;
  generatedVoices: GeneratedVoice[];
  internalDemoAccess?: boolean;
  licenses: DashboardLicense[];
  pendingVoiceRequests?: PendingVoiceRequest[];
  view: 'overview' | 'voices';
}

export function GeminiTTSDashboard({
  checkoutSucceeded = false,
  generatedVoices,
  internalDemoAccess = false,
  licenses,
  pendingVoiceRequests = [],
  view,
}: GeminiTTSDashboardProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [requests, setRequests] = useState(pendingVoiceRequests);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [requestError, setRequestError] = useState<string | null>(null);

  const activeLicenses = useMemo(() => licenses.filter(isActive), [licenses]);
  const activeProSolo = activeLicenses.find((license) => license.plan === 'pro_solo');
  const activeProTeam = activeLicenses.find((license) => license.plan === 'pro_team');
  const activeGeminiSolo = activeLicenses.find((license) => license.plan === 'gemini_tts_solo');
  const activeGeminiTeam = activeLicenses.find((license) => license.plan === 'gemini_tts_team');
  const activeGeminiLicense = activeGeminiTeam ?? activeGeminiSolo;
  const hadGeminiTtsSubscription = licenses.some(
    (license) => license.plan === 'gemini_tts_solo' || license.plan === 'gemini_tts_team',
  );
  const hasTeamHistory = licenses.some(
    (license) => license.plan === 'pro_team' || license.plan === 'gemini_tts_team',
  );
  const canManageVoices = Boolean(
    internalDemoAccess ||
    (activeGeminiTeam && activeProTeam) ||
    (activeGeminiSolo && (activeProSolo || activeProTeam)),
  );
  const suggestedTeamPlan = Boolean(activeProTeam || hasTeamHistory);
  const suggestedGeminiHref = suggestedTeamPlan
    ? getProPurchaseHref('geminiTtsTeam')
    : getProPurchaseHref('geminiTtsSolo');
  const suggestedGeminiLabel = suggestedTeamPlan ? 'Buy Gemini TTS Team' : 'Buy Gemini TTS Solo';
  const suggestedProHref = suggestedTeamPlan
    ? getProPurchaseHref('team')
    : getProPurchaseHref('solo');
  const suggestedProLabel = suggestedTeamPlan ? 'Buy Pro Team' : 'Buy Pro Solo';
  const needsBasePro = !activeProSolo && !activeProTeam;

  const pendingRequests = useMemo(
    () =>
      requests
        .filter((request) => request.status === 'pending')
        .sort(
          (left, right) =>
            new Date(right.requestedAt).getTime() - new Date(left.requestedAt).getTime(),
        ),
    [requests],
  );

  const selectedCount = selectedIds.size;
  const allPendingSelected =
    pendingRequests.length > 0 && pendingRequests.every((request) => selectedIds.has(request.id));

  function toggleRequest(id: string) {
    if (!canManageVoices) return;

    setSelectedIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function toggleAllPending() {
    if (!canManageVoices) return;

    setSelectedIds((current) => {
      if (allPendingSelected) {
        return new Set();
      }

      const next = new Set(current);
      pendingRequests.forEach((request) => next.add(request.id));
      return next;
    });
  }

  async function updateSelected(action: 'approve' | 'delete') {
    if (!canManageVoices) return;

    const ids = Array.from(selectedIds);
    setRequestError(null);

    const response = await fetch('/api/tts/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ids }),
    });

    if (!response.ok) {
      setRequestError('The selected voice requests could not be updated. Please try again.');
      return;
    }

    setRequests((current) => current.filter((request) => !selectedIds.has(request.id)));
    setSelectedIds(new Set());
    router.refresh();
  }

  if (!session) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="rounded-full border bg-muted p-3">
          <LogIn className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Gemini TTS dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Sign in with Google before purchasing Gemini TTS or approving requested voice generations.
        </p>
        <Button
          className="mt-6"
          disabled={isPending}
          onClick={() => {
            void authClient.signIn.social({
              provider: 'google',
              callbackURL: view === 'overview' ? '/dashboard' : '/dashboard/gemini-tts',
            });
          }}
        >
          <LogIn className="mr-2 h-4 w-4" />
          {isPending ? 'Checking session...' : 'Sign in with Google'}
        </Button>
      </div>
    );
  }

  return (
    <div className="py-8">
      {checkoutSucceeded && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-100">
          Purchase received. Your Gemini TTS license will appear here after Lemon Squeezy confirms
          the webhook.
        </div>
      )}

      <div className="flex flex-col gap-4 border-b pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {view === 'overview' ? 'Dashboard overview' : 'Gemini TTS voices'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {view === 'overview'
              ? 'Manage Cursor.js Pro products, subscriptions, and Gemini TTS plugin installation.'
              : 'Approve uncached Gemini TTS voice requests before hosted generation starts.'}
          </p>
        </div>
        {view === 'voices' && canManageVoices && (
          <div className="rounded-lg border bg-card px-4 py-3 text-sm">
            <div className="font-semibold text-foreground">{pendingRequests.length} pending</div>
            <div className="text-muted-foreground">Sorted by newest request</div>
          </div>
        )}
      </div>

      {view === 'overview' && (
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div
            className={
              activeProTeam || activeProSolo
                ? 'relative rounded-lg border border-green-200 bg-green-50 p-4 text-green-900 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-100'
                : 'rounded-lg border bg-card p-4'
            }
          >
            {(activeProTeam || activeProSolo) && (
              <Check className="absolute right-4 top-4 h-5 w-5 text-green-600 dark:text-green-300" />
            )}
            <div className="text-xs font-medium uppercase text-muted-foreground">Base license</div>
            <div className="mt-2 text-lg font-semibold">
              {activeProTeam ? 'Pro Team' : activeProSolo ? 'Pro Solo' : 'Not active'}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Required before purchasing Gemini TTS.
            </p>
            {needsBasePro && (
              <div className="mt-4">
                <Link
                  href="/pro#pricing"
                  className="inline-flex h-9 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
                >
                  View Pro plans
                </Link>
              </div>
            )}
          </div>
          <div
            className={
              activeGeminiLicense
                ? 'relative rounded-lg border border-green-200 bg-green-50 p-4 text-green-900 dark:border-green-900/60 dark:bg-green-950/30 dark:text-green-100'
                : needsBasePro
                  ? 'rounded-lg border bg-card p-4 opacity-50'
                  : 'rounded-lg border bg-card p-4'
            }
          >
            {activeGeminiLicense && (
              <Check className="absolute right-4 top-4 h-5 w-5 text-green-600 dark:text-green-300" />
            )}
            <div className="text-xs font-medium uppercase text-muted-foreground">Gemini TTS</div>
            <div className="mt-2 text-lg font-semibold">
              {activeGeminiTeam ? 'Team active' : activeGeminiSolo ? 'Solo active' : 'Not active'}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeGeminiLicense
                ? 'Hosted voice generation enabled'
                : 'Add-on required for approvals.'}
            </p>
            {!canManageVoices && !needsBasePro && (
              <div className="mt-4">
                <ProPurchaseButton href={suggestedGeminiHref}>
                  {suggestedGeminiLabel}
                </ProPurchaseButton>
              </div>
            )}
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-xs font-medium uppercase text-muted-foreground">Account</div>
            <div className="mt-2 truncate text-lg font-semibold">
              {session.user.name || session.user.email}
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">{session.user.email}</p>
          </div>
        </div>
      )}

      {view === 'overview' && (
        <section className="mt-8 rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Installation</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Use the Gemini TTS license key in your Pro plugin configuration. Keep this key private
            and rotate it if it is exposed.
          </p>

          {activeGeminiLicense ? (
            <div className="mt-4 space-y-4">
              <LicenseKeyField licenseKey={activeGeminiLicense.key} />
              <pre className="overflow-x-auto rounded-lg border bg-muted p-4 text-xs leading-6">
                <code>{`import { Cursor } from '@cursor.js/core';
import { GeminiTTSPlugin } from '@cursor.js/pro';

const cursor = new Cursor();

cursor.use(
  new GeminiTTSPlugin({
    mode: 'queue',
    licenseKey: '${activeGeminiLicense.key}',
    speaker: 'Aoede',
    style: 'conversational',
  }),
);`}</code>
              </pre>
            </div>
          ) : (
            <div className="mt-4 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              The plugin configuration appears after a Gemini TTS subscription is active.
            </div>
          )}
        </section>
      )}

      {view === 'overview' && (
        <section className="mt-8 rounded-lg border bg-card p-5">
          <div className="flex items-center gap-2">
            <Gem className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Products and subscriptions</h2>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">License key</th>
                  <th className="p-4 font-medium">Subscription</th>
                  <th className="p-4 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {licenses.map((license) => (
                  <tr key={license.id}>
                    <td className="p-4 font-medium text-foreground">
                      {getPlanLabel(license.plan)}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                        {license.status}
                      </span>
                    </td>
                    <td className="max-w-xs p-4">
                      {license.plan.startsWith('gemini_tts_') ? (
                        <LicenseKeyField licenseKey={license.key} />
                      ) : (
                        <span className="text-muted-foreground">Not required</span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {license.lemonSqueezySubscriptionId ?? license.lemonSqueezyOrderId ?? 'Order'}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {formatDashboardDate(license.updatedAt ?? license.createdAt)}
                    </td>
                  </tr>
                ))}
                {licenses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      No licenses are connected to this account yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {view === 'voices' && (
        <section id="voice-approval" className="mt-8 scroll-mt-24">
          {!hadGeminiTtsSubscription && !internalDemoAccess && (
            <div className="rounded-lg border bg-card p-6 text-center">
              <h2 className="text-lg font-semibold">Gemini TTS subscription required</h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                Gemini TTS voices are available after activating a Cursor.js Pro license and the
                matching Gemini TTS subscription.
              </p>
              <Link
                href="/pro#gemini-tts-add-on"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
              >
                View plans
              </Link>
            </div>
          )}

          {hadGeminiTtsSubscription && !canManageVoices && (
            <>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                <h2 className="text-lg font-semibold">Reactivate Gemini TTS voice generation</h2>
                <p className="mt-2 text-sm leading-6">
                  Voice history remains available, but new generation and approvals require an
                  active Cursor.js Pro plan and the matching Gemini TTS subscription.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <div className="min-w-44">
                    <ProPurchaseButton href={suggestedProHref}>
                      {suggestedProLabel}
                    </ProPurchaseButton>
                  </div>
                  <div className="min-w-44">
                    <ProPurchaseButton href={suggestedGeminiHref} variant="secondary">
                      {suggestedGeminiLabel}
                    </ProPurchaseButton>
                  </div>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-lg border bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="p-4 font-medium">Generated voice</th>
                      <th className="p-4 font-medium">Voice</th>
                      <th className="p-4 font-medium">Generated at</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {generatedVoices.map((voice) => (
                      <tr key={voice.id}>
                        <td className="max-w-xl p-4">
                          <div className="font-medium text-foreground">{voice.text}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{voice.id}</div>
                        </td>
                        <td className="p-4">
                          {voice.speaker} | {voice.language}
                        </td>
                        <td className="p-4">
                          {voice.generatedAt ? formatRequestDate(voice.generatedAt) : 'Pending'}
                        </td>
                      </tr>
                    ))}
                    {generatedVoices.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-6 text-center text-muted-foreground">
                          No previously generated voices.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {canManageVoices && (
            <div>
              <div className="flex flex-col gap-4 border-b pb-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Voice approval queue</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Review voice lines requested by `GeminiTTSPlugin`. Select multiple requests,
                    approve them for generation, or delete abusive requests before they reach the
                    API.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  variant="outline"
                  onClick={toggleAllPending}
                  disabled={pendingRequests.length === 0}
                >
                  {allPendingSelected ? 'Clear selection' : 'Select all pending'}
                </Button>
                <Button
                  onClick={() => void updateSelected('approve')}
                  disabled={selectedCount === 0}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve selected
                </Button>
                <Button
                  variant="outline"
                  onClick={() => void updateSelected('delete')}
                  disabled={selectedCount === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete selected
                </Button>
                <span className="text-sm text-muted-foreground">{selectedCount} selected</span>
              </div>
              {requestError && <p className="mt-3 text-sm text-destructive">{requestError}</p>}

              <div className="mt-6 overflow-hidden rounded-lg border bg-card">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="w-12 p-4"></th>
                      <th className="p-4 font-medium">Requested voice</th>
                      <th className="p-4 font-medium">Voice</th>
                      <th className="p-4 font-medium">Requested at</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingRequests.map((request) => (
                      <tr key={request.id} className="transition-colors hover:bg-muted/30">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="size-4"
                            checked={selectedIds.has(request.id)}
                            onChange={() => toggleRequest(request.id)}
                            aria-label={`Select ${request.id}`}
                          />
                        </td>
                        <td className="max-w-xl p-4">
                          <div className="font-medium text-foreground">{request.text}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{request.id}</div>
                        </td>
                        <td className="p-4">
                          {request.speaker} | {request.language}
                        </td>
                        <td className="p-4">{formatRequestDate(request.requestedAt)}</td>
                        <td className="p-4">
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
                            Pending approval
                          </span>
                        </td>
                      </tr>
                    ))}
                    {pendingRequests.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No pending Gemini TTS requests.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {view === 'overview' && (
        <div className="mt-6 text-sm text-muted-foreground">
          Need the full package setup?{' '}
          <Link
            href="/docs/pro-installation"
            className="font-medium text-foreground hover:underline"
          >
            Open Pro installation docs
          </Link>
          .
        </div>
      )}
    </div>
  );
}

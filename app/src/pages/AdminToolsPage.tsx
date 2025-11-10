import { FormEvent, useMemo, useState } from 'react';

import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';

export default function AdminToolsPage() {
  const {
    syncRemoteSources,
    runMatchingJob,
    uploadMuseumDataset,
    uploadOnlineDataset,
    loading
  } = useData();
  const { pushToast } = useToast();

  const [museumPayload, setMuseumPayload] = useState('');
  const [onlinePayload, setOnlinePayload] = useState('');
  const [busy, setBusy] = useState(false);

  const disabled = useMemo(() => loading || busy, [loading, busy]);

  const handleSync = async () => {
    try {
      setBusy(true);
      const result = await syncRemoteSources();
      pushToast({
        variant: 'success',
        title: 'Datasets refreshed',
        description: `Museum: ${result.museum_updated}, Online: ${result.online_updated}`
      });
    } catch (error) {
      pushToast({
        variant: 'error',
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Unexpected error'
      });
    } finally {
      setBusy(false);
    }
  };

  const handleMatch = async () => {
    try {
      setBusy(true);
      const result = await runMatchingJob();
      pushToast({
        variant: 'success',
        title: 'Matching complete',
        description: `Updated ${result.matches_updated} pairs`
      });
    } catch (error) {
      pushToast({
        variant: 'error',
        title: 'Matching failed',
        description: error instanceof Error ? error.message : 'Unexpected error'
      });
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>, type: 'museum' | 'online') => {
    event.preventDefault();
    const payloadText = type === 'museum' ? museumPayload : onlinePayload;
    if (!payloadText.trim()) {
      pushToast({ variant: 'error', title: 'No payload provided' });
      return;
    }
    try {
      const json = JSON.parse(payloadText);
      setBusy(true);
      const count =
        type === 'museum' ? await uploadMuseumDataset(json) : await uploadOnlineDataset(json);
      pushToast({
        variant: 'success',
        title: 'Upload complete',
        description: `${count} record(s) ingested`
      });
    } catch (error) {
      pushToast({
        variant: 'error',
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Unexpected error'
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-stone-400">Administration</p>
        <h1 className="text-3xl font-display text-stone-900">Data Synchronization & Ingestion</h1>
        <p className="max-w-3xl text-sm text-stone-600">
          Trigger remote dataset refresh, run the matching algorithm, or upload ad-hoc museum and
          online coin records for testing. Payloads accept single objects or arrays of records.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-2">
        <article className="space-y-4 rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
          <h2 className="text-xl font-display text-stone-900">Sync remote sources</h2>
          <p className="text-sm text-stone-500">
            Fetch the latest museum and online coin datasets from configured cloud sources.
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={handleSync}
            className="inline-flex items-center justify-center rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Processing…' : 'Sync datasets'}
          </button>
        </article>

        <article className="space-y-4 rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card">
          <h2 className="text-xl font-display text-stone-900">Run matching</h2>
          <p className="text-sm text-stone-500">
            Execute the lightweight matching algorithm across all museum and online coins. Existing
            accepted matches remain untouched.
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={handleMatch}
            className="inline-flex items-center justify-center rounded-md border border-gold-300 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-gold-500 transition hover:border-gold-400 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Processing…' : 'Run matching'}
          </button>
        </article>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <UploadForm
          title="Upload museum coins"
          description="Paste JSON for one or multiple museum coin records. Each entry must include a unique `coin_id`."
          value={museumPayload}
          onChange={setMuseumPayload}
          onSubmit={(event) => handleUpload(event, 'museum')}
          disabled={disabled}
        />
        <UploadForm
          title="Upload online coins"
          description="Paste JSON for online auction listings or scraped records. Each entry must include a unique `coin_id` or `id`."
          value={onlinePayload}
          onChange={setOnlinePayload}
          onSubmit={(event) => handleUpload(event, 'online')}
          disabled={disabled}
        />
      </section>
    </div>
  );
}

interface UploadFormProps {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  disabled: boolean;
}

function UploadForm({ title, description, value, onChange, onSubmit, disabled }: UploadFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white/80 p-6 shadow-card"
    >
      <div>
        <h2 className="text-xl font-display text-stone-900">{title}</h2>
        <p className="mt-1 text-sm text-stone-500">{description}</p>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder='[{"coin_id": "...", "mint": "..."}]'
        rows={10}
        className="w-full resize-vertical rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-sm text-stone-700 shadow-inner focus:border-gold-300 focus:outline-none focus:ring-2 focus:ring-gold-200"
        disabled={disabled}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-md bg-gold-500 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {disabled ? 'Uploading…' : 'Upload JSON'}
        </button>
      </div>
    </form>
  );
}


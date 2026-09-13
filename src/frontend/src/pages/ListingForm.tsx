import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useImageUpload } from "@/hooks/useImageUpload";
import {
  useCreateListing,
  useGetListing,
  useUpdateListing,
} from "@/hooks/useQueries";
import { PLATFORM_OPTIONS, Platform, RANK_TIERS } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  Save,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ListingFormPage() {
  const params = useParams({ strict: false }) as { listingId?: string };
  const listingId = params.listingId;
  const navigate = useNavigate();
  const { isAuthenticated, login } = useInternetIdentity();
  const isEdit = listingId !== undefined;
  const id = isEdit ? BigInt(listingId) : undefined;
  const { data: existing, isLoading: existingLoading } = useGetListing(id);
  const createListing = useCreateListing();
  const updateListing = useUpdateListing();
  const { uploadImage, imageUrl } = useImageUpload();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [platform, setPlatform] = useState<Platform>(Platform.playstation);
  const [rank, setRank] = useState<string>(RANK_TIERS[0]);
  const [prestige, setPrestige] = useState("1");
  const [level, setLevel] = useState("1");
  const [kdRatio, setKdRatio] = useState("1.00");
  const [wins, setWins] = useState("0");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEdit && existing) {
      setTitle(existing.title);
      setDescription(existing.description);
      setPlatform(existing.platform);
      setRank(existing.rank);
      setPrestige(existing.prestige.toString());
      setLevel(existing.stats.level.toString());
      setKdRatio(existing.stats.kdRatio.toFixed(2));
      setWins(existing.stats.wins.toString());
      setPrice(existing.price.toString());
      setImages(existing.images);
    }
  }, [isEdit, existing]);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const urls = await Promise.all(
        images.map((ref) => imageUrl(ref).catch(() => ref)),
      );
      if (!cancelled) setPreviews(urls);
    };
    void resolve();
    return () => {
      cancelled = true;
    };
  }, [images, imageUrl]);

  if (!isAuthenticated) {
    return (
      <div
        className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6"
        data-ocid="form.unauth"
      >
        <ShieldCheck className="size-12 text-primary" />
        <h1 className="font-display text-2xl font-bold">
          Sign in to {isEdit ? "edit" : "create"} a listing
        </h1>
        <p className="max-w-md text-muted-foreground">
          You need an Internet Identity to list accounts on the marketplace.
        </p>
        <Button size="lg" onClick={() => login()} data-ocid="form.login">
          Sign In with Internet Identity
        </Button>
      </div>
    );
  }

  if (isEdit && existingLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (isEdit && !existing) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center sm:px-6">
        <h1 className="font-display text-2xl font-bold">Listing not found</h1>
        <Button asChild variant="outline" data-ocid="form.back">
          <Link to="/">Back to browse</Link>
        </Button>
      </div>
    );
  }

  const canSubmit =
    title.trim() !== "" &&
    description.trim() !== "" &&
    price !== "" &&
    Number(price) > 0 &&
    !uploading;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    const fileList = Array.from(files);
    const uploaded: string[] = [];
    try {
      for (const file of fileList) {
        const reference = await uploadImage(file, (pct) =>
          setUploadProgress(pct),
        );
        uploaded.push(reference);
      }
      setImages((current) => [...current, ...uploaded]);
    } catch {
      setUploadError("One or more images failed to upload. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      title: title.trim(),
      description: description.trim(),
      platform,
      rank,
      prestige: BigInt(prestige || "0"),
      stats: {
        level: BigInt(level || "0"),
        kdRatio: Number(kdRatio || "0"),
        wins: BigInt(wins || "0"),
      },
      price: BigInt(price),
      images,
    };

    if (isEdit && id !== undefined) {
      updateListing.mutate(
        { ...input, id },
        {
          onSuccess: () => {
            void navigate({ to: "/listing/$listingId", params: { listingId } });
          },
        },
      );
    } else {
      createListing.mutate(input, {
        onSuccess: (listing) => {
          void navigate({
            to: "/listing/$listingId",
            params: { listingId: listing.id.toString() },
          });
        },
      });
    }
  };

  const isPending = createListing.isPending || updateListing.isPending;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="mb-6 w-fit"
        data-ocid="form.back"
      >
        <Link to={isEdit ? "/dashboard" : "/"}>
          <ArrowLeft className="size-4" />
          {isEdit ? "Back to dashboard" : "Back to browse"}
        </Link>
      </Button>

      <h1 className="font-display text-3xl font-bold tracking-tight">
        {isEdit ? "Edit Listing" : "Sell Your Account"}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {isEdit
          ? "Update the details of your account dossier."
          : "Fill out the dossier to list your account on the marketplace."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Crimson Ranked Warzone Account"
            data-ocid="form.title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the account, loadouts, and what's included…"
            data-ocid="form.description"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select
              value={platform}
              onValueChange={(v) => setPlatform(v as Platform)}
            >
              <SelectTrigger className="w-full" data-ocid="form.platform">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORM_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Rank Tier</Label>
            <Select value={rank} onValueChange={setRank}>
              <SelectTrigger className="w-full" data-ocid="form.rank">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANK_TIERS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="prestige">Prestige</Label>
            <Input
              id="prestige"
              type="number"
              min={0}
              value={prestige}
              onChange={(e) => setPrestige(e.target.value)}
              data-ocid="form.prestige"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Input
              id="level"
              type="number"
              min={0}
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              data-ocid="form.level"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kd">K/D Ratio</Label>
            <Input
              id="kd"
              type="number"
              step="0.01"
              min={0}
              value={kdRatio}
              onChange={(e) => setKdRatio(e.target.value)}
              data-ocid="form.kd"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wins">Wins</Label>
            <Input
              id="wins"
              type="number"
              min={0}
              value={wins}
              onChange={(e) => setWins(e.target.value)}
              data-ocid="form.wins"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price (USD)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 150"
            data-ocid="form.price"
          />
        </div>

        <div className="space-y-3">
          <Label>Account Screenshots</Label>
          <input
            ref={fileInputRef}
            id="images"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
            data-ocid="form.images"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-card/50 px-4 py-8 text-center transition-colors hover:border-primary/60 hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
            data-ocid="form.upload_button"
          >
            {uploading ? (
              <Loader2 className="size-8 animate-spin text-primary" />
            ) : (
              <UploadCloud className="size-8 text-primary" />
            )}
            <span className="font-medium">
              {uploading ? "Uploading…" : "Upload screenshots"}
            </span>
            <span className="text-sm text-muted-foreground">
              PNG, JPG or WebP. The first image is used as the thumbnail.
            </span>
          </button>

          {uploading && (
            <div className="space-y-1">
              <Progress
                value={uploadProgress}
                data-ocid="form.upload_progress"
              />
              <p className="text-xs text-muted-foreground">
                Uploading… {Math.round(uploadProgress)}%
              </p>
            </div>
          )}

          {uploadError && (
            <p
              className="text-sm text-destructive"
              data-ocid="form.upload_error"
            >
              {uploadError}
            </p>
          )}

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {previews.map((src, i) => (
                <div
                  key={images[i] ?? `preview-${i}`}
                  className="group relative aspect-[16/10] overflow-hidden rounded-md border bg-card"
                  data-ocid={`form.image.${i + 1}`}
                >
                  <img
                    src={src}
                    alt={`Screenshot ${i + 1}`}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((current) =>
                        current.filter((_, idx) => idx !== i),
                      )
                    }
                    disabled={uploading}
                    className="absolute top-1 right-1 rounded-md bg-background/80 p-1 text-foreground opacity-0 transition-opacity hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100 disabled:opacity-0"
                    aria-label={`Remove screenshot ${i + 1}`}
                    data-ocid={`form.image.remove.${i + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {(createListing.isError || updateListing.isError) && (
          <p className="text-sm text-destructive" data-ocid="form.error">
            Unable to save the listing. Please try again.
          </p>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={!canSubmit || isPending}
            data-ocid="form.submit_button"
          >
            <Save className="size-4" />
            {isPending
              ? "Saving…"
              : isEdit
                ? "Save Changes"
                : "Publish Listing"}
          </Button>
          <Button
            asChild
            type="button"
            variant="outline"
            size="lg"
            data-ocid="form.cancel_button"
          >
            <Link to={isEdit ? "/dashboard" : "/"}>Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}

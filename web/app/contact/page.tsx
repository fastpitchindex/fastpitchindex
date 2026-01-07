"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Layout from "@/components/Layout";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import { sanitizeEmail, sanitizeText, sanitizeUrl, sanitizeTextarea, validateFiles } from "@/lib/utils";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formStatus, setFormStatus] = useState("");

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const inquiryType = form.querySelector<HTMLSelectElement>("#inquiryType");
    const listingFields = form.querySelector<HTMLFieldSetElement>("#listingFields");
    const submitFields = form.querySelector<HTMLFieldSetElement>("#submitFields");
    const supportFields = form.querySelector<HTMLFieldSetElement>("#supportFields");

    if (!inquiryType || !listingFields || !submitFields || !supportFields) return;

    // Get all required fields in each fieldset (including those that should be required when visible)
    const listingUrl = listingFields.querySelector<HTMLInputElement>("#listingUrl");
    const listingCategory = listingFields.querySelector<HTMLSelectElement>("#listingCategory");
    const proposedCorrection = listingFields.querySelector<HTMLTextAreaElement>("#proposedCorrection");
    
    const listingRequired = [
      listingUrl,
      listingCategory,
      proposedCorrection,
    ].filter((el): el is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement => el !== null);
    
    const submitRequired = submitFields.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[required]");
    const supportRequired = supportFields.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("[required]");

    const setRequired = (elements: NodeListOf<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, required: boolean) => {
      elements.forEach((el) => {
        if (required) {
          el.setAttribute("required", "");
        } else {
          el.removeAttribute("required");
        }
      });
    };

    const updateVisibility = () => {
      const t = inquiryType.value;
      const showListing = t === "Listing Correction";
      const showSubmit = t === "Submit Tournament";
      const showSupport = t === "Support";

      listingFields.style.display = showListing ? "block" : "none";
      submitFields.style.display = showSubmit ? "block" : "none";
      supportFields.style.display = showSupport ? "block" : "none";

      // Only require fields that are visible
      setRequired(listingRequired, showListing);
      setRequired(submitRequired, showSubmit);
      setRequired(supportRequired, showSupport);
    };

    inquiryType.addEventListener("change", updateVisibility);
    updateVisibility();

    const typeParam = searchParams.get("type");
    const eventParam = searchParams.get("event");
    
    if (typeParam === "correction") {
      inquiryType.value = "Listing Correction";
      updateVisibility();
      
      // Auto-populate listing URL if event parameter is provided
      if (eventParam) {
        const listingUrl = form.querySelector<HTMLInputElement>("#listingUrl");
        if (listingUrl) {
          const currentUrl = typeof window !== "undefined" ? window.location.origin : "";
          listingUrl.value = `${currentUrl}/tournaments/${encodeURIComponent(eventParam)}`;
        }
      }
    }

    return () => {
      inquiryType.removeEventListener("change", updateVisibility);
    };
  }, [searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("Sending...");

    try {
      const form = event.currentTarget;
      const data = new FormData(form);
      
      // Validate file uploads if any
      const fileInputs = form.querySelectorAll<HTMLInputElement>('input[type="file"]');
      for (const fileInput of fileInputs) {
        if (fileInput.files && fileInput.files.length > 0) {
          const validation = validateFiles(fileInput.files);
          if (!validation.isValid) {
            setFormStatus(`File upload error: ${validation.errors.join(' ')}`);
            return;
          }
          // Remove invalid files from FormData and keep only valid ones
          // Note: FormData already contains the files, but we've validated them
          // If validation fails, we return early above
        }
      }
      
      // Sanitize all form inputs
      const name = sanitizeText(data.get("name") as string || "", 200);
      const email = sanitizeEmail(data.get("email") as string || "");
      const inquiryType = sanitizeText(data.get("inquiry_type") as string || "Contact", 100);
      
      // Sanitize listing correction fields
      const listingUrl = data.get("listing_url") ? sanitizeUrl(data.get("listing_url") as string) : null;
      const listingCategory = data.get("listing_category") ? sanitizeText(data.get("listing_category") as string || "", 100) : null;
      const proposedCorrection = data.get("proposed_correction") ? sanitizeTextarea(data.get("proposed_correction") as string) : null;
      
      // Sanitize tournament submission fields
      const tournamentName = data.get("tournament_name") ? sanitizeText(data.get("tournament_name") as string || "", 200) : null;
      const tournamentUrl = data.get("tournament_url") ? sanitizeUrl(data.get("tournament_url") as string) : null;
      const city = data.get("city") ? sanitizeText(data.get("city") as string || "", 100) : null;
      const state = data.get("state") ? sanitizeText(data.get("state") as string || "", 2) : null;
      const divisions = data.get("divisions") ? sanitizeText(data.get("divisions") as string || "", 200) : null;
      const organizer = data.get("organizer") ? sanitizeText(data.get("organizer") as string || "", 200) : null;
      
      // Sanitize support category
      const supportCategory = data.get("support_category") ? sanitizeText(data.get("support_category") as string || "", 100) : null;
      
      // Sanitize message
      const message = sanitizeTextarea(data.get("message") as string || "");
      
      // Update form data with sanitized values
      data.set("name", name);
      data.set("email", email);
      data.set("inquiry_type", inquiryType);
      if (listingUrl) data.set("listing_url", listingUrl);
      if (listingCategory) data.set("listing_category", listingCategory);
      if (proposedCorrection) data.set("proposed_correction", proposedCorrection);
      if (tournamentName) data.set("tournament_name", tournamentName);
      if (tournamentUrl) data.set("tournament_url", tournamentUrl);
      if (city) data.set("city", city);
      if (state) data.set("state", state);
      if (divisions) data.set("divisions", divisions);
      if (organizer) data.set("organizer", organizer);
      if (supportCategory) data.set("support_category", supportCategory);
      data.set("message", message);
      
      // Generate subject from inquiry type and date
      const submissionDate = new Date().toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric", 
        year: "numeric" 
      });
      const subject = `[FPI] ${inquiryType} - ${submissionDate}`;
      
      // Update the subject field
      data.set("_subject", subject);
      
      // Log form data for debugging (remove in production)
      console.log("Submitting form data:", {
        inquiry_type: inquiryType,
        name: name,
        email: email,
        subject: subject,
      });

      const resp = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { 
          Accept: "application/json",
        },
      });

      console.log("Form submission response:", resp.status, resp.statusText);

      if (resp.ok) {
        const result = await resp.json().catch(() => null);
        console.log("Form submission success:", result);
        // Only redirect if we got a successful response
        window.location.href = "/contact/thanks";
      } else {
        const payload = await resp.json().catch(() => null);
        console.error("Form submission failed:", payload);
        setFormStatus(
          payload?.errors?.[0]?.message ||
            `Submission failed (${resp.status}). Please try again or email fastpitchindex@gmail.com.`
        );
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setFormStatus("Network error. Please try again or email fastpitchindex@gmail.com.");
    }
  };

  return (
    <Layout>
      <section className="py-16 md:py-20">
      <Container>
        <div className="max-w-3xl">
          <PageHeader title="Contact Fastpitch Index" />
          <p className="text-muted-foreground mb-8">
            Use this form for listing corrections, tournament submissions, support, or general inquiries.
          </p>

          <form
            ref={formRef}
            action="https://formspree.io/f/mbdlbryg"
            method="POST"
            onSubmit={handleSubmit}
            className="space-y-4"
            encType="multipart/form-data"
          >
            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-foreground">
                Inquiry type<span aria-hidden="true">*</span>
              </span>
              <Select id="inquiryType" name="inquiry_type" required>
                <option value="">Select</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Listing Correction">Listing Correction</option>
                <option value="Submit Tournament">Submit Tournament</option>
                <option value="Support">Support</option>
              </Select>
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-foreground">
                Name<span aria-hidden="true">*</span>
              </span>
              <Input type="text" name="name" autoComplete="name" required />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-foreground">
                Email<span aria-hidden="true">*</span>
              </span>
              <Input type="email" name="email" autoComplete="email" required />
            </label>

            <fieldset id="listingFields" className="space-y-4 rounded-lg border border-border p-4" style={{ display: "none" }}>
              <legend className="px-1 text-sm font-semibold text-foreground">Listing Correction</legend>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-foreground">Listing URL<span aria-hidden="true">*</span></span>
                <Input type="url" id="listingUrl" name="listing_url" placeholder="https://..." required />
              </label>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-foreground">Category<span aria-hidden="true">*</span></span>
                <Select id="listingCategory" name="listing_category">
                  <option value="">Select</option>
                  <option value="Date">Date</option>
                  <option value="Location">Location</option>
                  <option value="Entry Fee">Entry Fee</option>
                  <option value="Division">Division</option>
                  <option value="Other">Other</option>
                </Select>
              </label>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-foreground">Proposed correction<span aria-hidden="true">*</span></span>
                <textarea
                  id="proposedCorrection"
                  name="proposed_correction"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </label>
            </fieldset>

            <fieldset id="submitFields" className="space-y-4 rounded-lg border border-border p-4" style={{ display: "none" }}>
              <legend className="px-1 text-sm font-semibold text-foreground">Submit Tournament</legend>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-foreground">Tournament name<span aria-hidden="true">*</span></span>
                <Input type="text" id="tournamentName" name="tournament_name" required />
              </label>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-foreground">Tournament URL<span aria-hidden="true">*</span></span>
                <Input type="url" id="tournamentUrl" name="tournament_url" required />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-2 block">
                  <span className="text-sm font-semibold text-foreground">Start date<span aria-hidden="true">*</span></span>
                  <Input type="date" id="startDate" name="start_date" required />
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm font-semibold text-foreground">End date<span aria-hidden="true">*</span></span>
                  <Input type="date" id="endDate" name="end_date" required />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-2 block">
                  <span className="text-sm font-semibold text-foreground">City<span aria-hidden="true">*</span></span>
                  <Input type="text" id="city" name="city" required />
                </label>
                <label className="space-y-2 block">
                  <span className="text-sm font-semibold text-foreground">State<span aria-hidden="true">*</span></span>
                  <Input type="text" id="state" name="state" maxLength={2} required />
                </label>
              </div>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-foreground">Divisions<span aria-hidden="true">*</span></span>
                <Input type="text" id="divisions" name="divisions" placeholder="10U, 12U, 14U" required />
              </label>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-foreground">Organizer / organization<span aria-hidden="true">*</span></span>
                <Input type="text" id="organizer" name="organizer" required />
              </label>
            </fieldset>

            <fieldset id="supportFields" className="space-y-4 rounded-lg border border-border p-4" style={{ display: "none" }}>
              <legend className="px-1 text-sm font-semibold text-foreground">Support</legend>
              <label className="space-y-2 block">
                <span className="text-sm font-semibold text-foreground">Issue category<span aria-hidden="true">*</span></span>
                <Select id="supportCategory" name="support_category">
                  <option value="">Select</option>
                  <option value="Search / filters">Search / Filters</option>
                  <option value="Missing listing">Missing Listing</option>
                  <option value="Incorrect results">Incorrect Results</option>
                  <option value="Bug / crash">Bug / Crash</option>
                  <option value="Feature request">Feature Request</option>
                  <option value="Other">Other</option>
                </Select>
              </label>
            </fieldset>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-foreground">
                Message<span aria-hidden="true">*</span>
              </span>
              <textarea
                name="message"
                rows={6}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </label>

            <label className="space-y-2 block">
              <span className="text-sm font-semibold text-foreground">
                Attachments (optional)
              </span>
              <input
                type="file"
                name="attachments"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground">
                Allowed file types: JPG, PNG, GIF, WEBP, PDF, DOC, DOCX, XLS, XLSX, TXT, CSV. Maximum file size: 10MB per file.
              </p>
            </label>

            <label className="flex items-start gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="consent" value="yes" required className="mt-1" />
              <span>I understand Fastpitch Index may contact me about this request.</span>
            </label>

            <input type="hidden" name="_subject" value="" />
            <input type="hidden" name="_next" value={typeof window !== "undefined" ? `${window.location.origin}/contact/thanks` : "/contact/thanks"} />
            <input type="text" name="_gotcha" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
            <input type="hidden" name="_format" value="plain" />

            <Button type="submit" variant="primary">
              Send
            </Button>

            <p role="status" className="text-sm text-muted-foreground">
              {formStatus}
            </p>

            <p className="text-sm text-muted-foreground">
              Prefer email? fastpitchindex@gmail.com
            </p>
          </form>
        </div>
      </Container>
    </section>
    </Layout>
  );
}

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "handle" TEXT NOT NULL,
    "onboarding_completed" BOOLEAN DEFAULT false,
    "onboarding_step" INTEGER DEFAULT 1,
    "name" TEXT,
    "is_business" BOOLEAN DEFAULT false,
    "slogan" TEXT,
    "avatar_url" TEXT,
    "accent_color" TEXT DEFAULT '#6E56CF',
    "theme_mode" TEXT NOT NULL DEFAULT 'light',
    "booking_url" TEXT,
    "booking_mode" TEXT NOT NULL DEFAULT 'embed',
    "use_whatsapp" BOOLEAN DEFAULT false,
    "whatsapp_number" TEXT,
    "about" JSONB NOT NULL DEFAULT '{}',
    "media" JSONB NOT NULL DEFAULT '{"items": []}',
    "socials" JSONB NOT NULL DEFAULT '{}',
    "contact" JSONB NOT NULL DEFAULT '{}',
    "banner" JSONB NOT NULL DEFAULT '{}',
    "footer" JSONB NOT NULL DEFAULT '{}',
    "footer_business_name" TEXT,
    "footer_address" TEXT,
    "footer_email" TEXT,
    "footer_phone" TEXT,
    "footer_hours" JSONB,
    "footer_next_available" TEXT,
    "footer_cancellation_policy" TEXT,
    "footer_privacy_policy" TEXT,
    "footer_terms_of_service" TEXT,
    "footer_show_maps" BOOLEAN DEFAULT true,
    "footer_show_attribution" BOOLEAN DEFAULT true,
    "testimonials" JSONB DEFAULT '[]',
    "preview_expires_at" TIMESTAMPTZ(6),
    "preview_started_at" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripe_customer_id" TEXT,
    "subscription_id" UUID,
    "subscription_status" TEXT DEFAULT 'inactive',
    "trial_start_date" TIMESTAMPTZ(6),
    "trial_end_date" TIMESTAMPTZ(6),
    "grace_period_ends_at" TIMESTAMPTZ(6),
    "banner_url" TEXT,
    "category" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invoices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subscription_id" UUID,
    "profile_id" UUID,
    "stripe_invoice_id" TEXT,
    "amount" INTEGER,
    "currency" TEXT DEFAULT 'eur',
    "status" TEXT DEFAULT 'draft',
    "invoice_pdf_url" TEXT,
    "hosted_invoice_url" TEXT,
    "due_date" TIMESTAMPTZ(6),
    "paid_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."payment_methods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subscription_id" UUID,
    "profile_id" UUID,
    "stripe_payment_method_id" TEXT,
    "type" TEXT,
    "last4" TEXT,
    "brand" TEXT,
    "exp_month" INTEGER,
    "exp_year" INTEGER,
    "is_default" BOOLEAN DEFAULT false,
    "country" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."stripe_events" (
    "event_id" TEXT NOT NULL,
    "type" TEXT,
    "created" TIMESTAMPTZ(6),
    "raw" JSONB,

    CONSTRAINT "stripe_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "profile_id" UUID NOT NULL,
    "stripe_subscription_id" TEXT NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "current_period_start" TIMESTAMPTZ(6) NOT NULL,
    "current_period_end" TIMESTAMPTZ(6) NOT NULL,
    "cancel_at_period_end" BOOLEAN DEFAULT false,
    "trial_start" TIMESTAMPTZ(6),
    "trial_end" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_handle_key" ON "public"."profiles"("handle");

-- CreateIndex
CREATE INDEX "idx_profiles_handle" ON "public"."profiles"("handle");

-- CreateIndex
CREATE INDEX "idx_profiles_onboarding_completed" ON "public"."profiles"("onboarding_completed");

-- CreateIndex
CREATE INDEX "idx_profiles_onboarding_step" ON "public"."profiles"("onboarding_step");

-- CreateIndex
CREATE INDEX "idx_profiles_status" ON "public"."profiles"("status");

-- CreateIndex
CREATE INDEX "idx_profiles_stripe_customer_id" ON "public"."profiles"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "idx_profiles_subscription_id" ON "public"."profiles"("subscription_id");

-- CreateIndex
CREATE INDEX "idx_profiles_subscription_status" ON "public"."profiles"("subscription_status");

-- CreateIndex
CREATE INDEX "idx_profiles_user_id" ON "public"."profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_stripe_invoice_id_key" ON "public"."invoices"("stripe_invoice_id");

-- CreateIndex
CREATE INDEX "idx_invoices_profile_id" ON "public"."invoices"("profile_id");

-- CreateIndex
CREATE INDEX "idx_invoices_stripe_invoice_id" ON "public"."invoices"("stripe_invoice_id");

-- CreateIndex
CREATE INDEX "idx_invoices_subscription_id" ON "public"."invoices"("subscription_id");

-- CreateIndex
CREATE INDEX "idx_payment_methods_profile_id" ON "public"."payment_methods"("profile_id");

-- CreateIndex
CREATE INDEX "idx_payment_methods_subscription_id" ON "public"."payment_methods"("subscription_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "public"."subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_profile_id" ON "public"."subscriptions"("profile_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_stripe_customer_id" ON "public"."subscriptions"("stripe_customer_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_stripe_subscription_id" ON "public"."subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "subscriptions_profile_idx" ON "public"."subscriptions"("profile_id");

-- CreateIndex
CREATE INDEX "subscriptions_subid_idx" ON "public"."subscriptions"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "idx_subscriptions_status" ON "public"."subscriptions"("status");

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."invoices" ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."payment_methods" ADD CONSTRAINT "payment_methods_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."payment_methods" ADD CONSTRAINT "payment_methods_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."subscriptions" ADD CONSTRAINT "subscriptions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- unique lowercase handle
create unique index if not exists profiles_handle_unique on public.profiles ((lower(handle)));
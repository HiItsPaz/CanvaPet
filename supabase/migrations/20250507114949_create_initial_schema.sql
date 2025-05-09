-- ********************************
-- CanvaPet Database Schema
-- ********************************
-- This migration creates the initial database schema for the CanvaPet application.
-- It includes tables for users, pets, portraits, styles, customization options, orders, and feedback.
-- Each table is extensively commented to explain the purpose of each column and table.

-- Create the necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --------------------------------
-- Table: profiles
-- --------------------------------
-- Description: Stores public user profile information, extending the auth.users table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint to ensure username is at least 3 characters long
ALTER TABLE public.profiles ADD CONSTRAINT username_length CHECK (char_length(username) >= 3);

COMMENT ON TABLE public.profiles IS 'Public user profiles for CanvaPet users, extending the auth.users table';
COMMENT ON COLUMN public.profiles.id IS 'Primary key, references auth.users.id with cascade delete';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp of the last profile update';
COMMENT ON COLUMN public.profiles.username IS 'User-selected unique username, minimum 3 characters';
COMMENT ON COLUMN public.profiles.full_name IS 'Full name of the user';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL to the user''s profile picture';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp when the profile was created';

-- Enable Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- --------------------------------
-- Table: pets
-- --------------------------------
-- Description: Stores information about pets owned by users
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    age_years INTEGER,
    original_image_url TEXT,
    additional_image_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

COMMENT ON TABLE public.pets IS 'Stores information about pets owned by CanvaPet users';
COMMENT ON COLUMN public.pets.id IS 'Unique identifier for the pet';
COMMENT ON COLUMN public.pets.user_id IS 'Foreign key referencing the owner user, cascades on delete';
COMMENT ON COLUMN public.pets.name IS 'Name of the pet';
COMMENT ON COLUMN public.pets.species IS 'Species of the pet (e.g., "Dog", "Cat", "Bird")';
COMMENT ON COLUMN public.pets.breed IS 'Breed of the pet, if applicable';
COMMENT ON COLUMN public.pets.age_years IS 'Age of the pet in years';
COMMENT ON COLUMN public.pets.original_image_url IS 'URL to the primary uploaded image of the pet';
COMMENT ON COLUMN public.pets.additional_image_urls IS 'Array of URLs for additional pet images';
COMMENT ON COLUMN public.pets.created_at IS 'Timestamp when the pet record was created';
COMMENT ON COLUMN public.pets.updated_at IS 'Timestamp when the pet record was last updated';
COMMENT ON COLUMN public.pets.is_active IS 'Boolean flag indicating if the pet profile is active';

-- Enable Row Level Security for pets
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- RLS policies for pets table
CREATE POLICY "Users can view their own pets" 
    ON public.pets FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pets" 
    ON public.pets FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets" 
    ON public.pets FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets" 
    ON public.pets FOR DELETE 
    USING (auth.uid() = user_id);

-- --------------------------------
-- Table: styles
-- --------------------------------
-- Description: Stores available art styles for portrait generation
CREATE TABLE IF NOT EXISTS public.styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    thumbnail_url TEXT,
    prompt_template TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.styles IS 'Stores art styles available for AI portrait generation';
COMMENT ON COLUMN public.styles.id IS 'Unique identifier for the style';
COMMENT ON COLUMN public.styles.name IS 'Name of the art style (e.g., "Van Gogh", "Watercolor", "Anime")';
COMMENT ON COLUMN public.styles.description IS 'Description of the art style';
COMMENT ON COLUMN public.styles.thumbnail_url IS 'URL to a sample image of the art style';
COMMENT ON COLUMN public.styles.prompt_template IS 'Template text to guide AI generation for this style';
COMMENT ON COLUMN public.styles.is_active IS 'Boolean flag indicating if the style is currently available';
COMMENT ON COLUMN public.styles.created_at IS 'Timestamp when the style was created';
COMMENT ON COLUMN public.styles.updated_at IS 'Timestamp when the style was last updated';

-- Enable Row Level Security for styles
ALTER TABLE public.styles ENABLE ROW LEVEL SECURITY;

-- RLS policies for styles table - Viewable by anyone, manageable by admins
CREATE POLICY "Anyone can view active styles" 
    ON public.styles FOR SELECT 
    USING (is_active = TRUE);

-- --------------------------------
-- Table: customization_options
-- --------------------------------
-- Description: Stores customization options that can be applied to portraits
CREATE TABLE IF NOT EXISTS public.customization_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    value JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.customization_options IS 'Stores customization options for portraits (backgrounds, accessories, etc.)';
COMMENT ON COLUMN public.customization_options.id IS 'Unique identifier for the customization option';
COMMENT ON COLUMN public.customization_options.name IS 'Name of the option (e.g., "Space Background", "Crown Accessory")';
COMMENT ON COLUMN public.customization_options.type IS 'Type of option (e.g., "background", "accessory", "filter")';
COMMENT ON COLUMN public.customization_options.description IS 'Description of the customization option';
COMMENT ON COLUMN public.customization_options.thumbnail_url IS 'URL to a thumbnail image of the option';
COMMENT ON COLUMN public.customization_options.value IS 'JSON data containing specific parameters for this option';
COMMENT ON COLUMN public.customization_options.is_active IS 'Boolean flag indicating if the option is currently available';
COMMENT ON COLUMN public.customization_options.created_at IS 'Timestamp when the option was created';
COMMENT ON COLUMN public.customization_options.updated_at IS 'Timestamp when the option was last updated';

-- Enable Row Level Security for customization_options
ALTER TABLE public.customization_options ENABLE ROW LEVEL SECURITY;

-- RLS policies for customization_options table
CREATE POLICY "Anyone can view active customization options" 
    ON public.customization_options FOR SELECT 
    USING (is_active = TRUE);

-- --------------------------------
-- Table: portraits
-- --------------------------------
-- Description: Stores information about generated AI pet portraits
CREATE TABLE IF NOT EXISTS public.portraits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    style_id UUID REFERENCES styles(id) ON DELETE SET NULL,
    input_image_url TEXT NOT NULL,
    generated_image_url TEXT,
    thumbnail_url TEXT,
    customization_params JSONB,
    status TEXT NOT NULL DEFAULT 'pending',
    generation_time_seconds INTEGER,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.portraits IS 'Stores generated AI pet portraits';
COMMENT ON COLUMN public.portraits.id IS 'Unique identifier for the portrait';
COMMENT ON COLUMN public.portraits.user_id IS 'Foreign key referencing the user who created the portrait';
COMMENT ON COLUMN public.portraits.pet_id IS 'Foreign key referencing the pet in the portrait';
COMMENT ON COLUMN public.portraits.style_id IS 'Foreign key referencing the art style used';
COMMENT ON COLUMN public.portraits.input_image_url IS 'URL of the original pet image used for generation';
COMMENT ON COLUMN public.portraits.generated_image_url IS 'URL of the generated portrait image';
COMMENT ON COLUMN public.portraits.thumbnail_url IS 'URL of the portrait thumbnail';
COMMENT ON COLUMN public.portraits.customization_params IS 'JSON data with all customization options applied';
COMMENT ON COLUMN public.portraits.status IS 'Status of the portrait generation (pending, processing, completed, failed)';
COMMENT ON COLUMN public.portraits.generation_time_seconds IS 'Time taken to generate the portrait in seconds';
COMMENT ON COLUMN public.portraits.is_public IS 'Boolean flag indicating if the portrait is publicly viewable';
COMMENT ON COLUMN public.portraits.created_at IS 'Timestamp when the portrait was created';
COMMENT ON COLUMN public.portraits.updated_at IS 'Timestamp when the portrait was last updated';

-- Enable Row Level Security for portraits
ALTER TABLE public.portraits ENABLE ROW LEVEL SECURITY;

-- RLS policies for portraits table
CREATE POLICY "Users can view their own portraits" 
    ON public.portraits FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Public portraits can be viewed by anyone" 
    ON public.portraits FOR SELECT 
    USING (is_public = TRUE);

CREATE POLICY "Users can insert their own portraits" 
    ON public.portraits FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portraits" 
    ON public.portraits FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portraits" 
    ON public.portraits FOR DELETE 
    USING (auth.uid() = user_id);

-- --------------------------------
-- Table: portrait_customization_options_applied
-- --------------------------------
-- Description: Junction table linking portraits to customization options
CREATE TABLE IF NOT EXISTS public.portrait_customization_options_applied (
    portrait_id UUID REFERENCES portraits(id) ON DELETE CASCADE,
    customization_option_id UUID REFERENCES customization_options(id) ON DELETE CASCADE,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (portrait_id, customization_option_id)
);

COMMENT ON TABLE public.portrait_customization_options_applied IS 'Junction table linking portraits to their applied customization options';
COMMENT ON COLUMN public.portrait_customization_options_applied.portrait_id IS 'Foreign key referencing the portrait';
COMMENT ON COLUMN public.portrait_customization_options_applied.customization_option_id IS 'Foreign key referencing the customization option';
COMMENT ON COLUMN public.portrait_customization_options_applied.applied_at IS 'Timestamp when the option was applied to the portrait';

-- Enable Row Level Security for portrait_customization_options_applied
ALTER TABLE public.portrait_customization_options_applied ENABLE ROW LEVEL SECURITY;

-- RLS policies for portrait_customization_options_applied table - Based on portrait ownership
CREATE POLICY "Users can view options applied to their portraits" 
    ON public.portrait_customization_options_applied FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM portraits 
        WHERE portraits.id = portrait_id 
        AND (portraits.user_id = auth.uid() OR portraits.is_public = TRUE)
    ));

-- --------------------------------
-- Table: merchandise
-- --------------------------------
-- Description: Stores types of physical merchandise available for purchase
CREATE TABLE IF NOT EXISTS public.merchandise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    base_price NUMERIC(10, 2) NOT NULL,
    sku TEXT UNIQUE,
    dimensions TEXT,
    provider_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.merchandise IS 'Stores types of physical merchandise available for purchase';
COMMENT ON COLUMN public.merchandise.id IS 'Unique identifier for the merchandise item';
COMMENT ON COLUMN public.merchandise.name IS 'Name of the merchandise (e.g., "11oz Mug", "Large Canvas Print")';
COMMENT ON COLUMN public.merchandise.description IS 'Description of the merchandise';
COMMENT ON COLUMN public.merchandise.base_price IS 'Base price of the item before customization';
COMMENT ON COLUMN public.merchandise.sku IS 'Stock Keeping Unit, unique product identifier';
COMMENT ON COLUMN public.merchandise.dimensions IS 'Physical dimensions of the merchandise (e.g., "12x16 inches")';
COMMENT ON COLUMN public.merchandise.provider_id IS 'ID from print-on-demand provider (if applicable)';
COMMENT ON COLUMN public.merchandise.is_active IS 'Boolean flag indicating if the merchandise is currently available';
COMMENT ON COLUMN public.merchandise.created_at IS 'Timestamp when the merchandise was added';
COMMENT ON COLUMN public.merchandise.updated_at IS 'Timestamp when the merchandise was last updated';

-- Enable Row Level Security for merchandise
ALTER TABLE public.merchandise ENABLE ROW LEVEL SECURITY;

-- RLS policies for merchandise table
CREATE POLICY "Anyone can view active merchandise" 
    ON public.merchandise FOR SELECT 
    USING (is_active = TRUE);

-- --------------------------------
-- Table: orders
-- --------------------------------
-- Description: Stores information about user orders
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount NUMERIC(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_gateway TEXT,
    payment_intent_id TEXT UNIQUE,
    shipping_address JSONB,
    billing_address JSONB,
    tracking_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.orders IS 'Stores customer orders for pet portraits and merchandise';
COMMENT ON COLUMN public.orders.id IS 'Unique identifier for the order';
COMMENT ON COLUMN public.orders.user_id IS 'Foreign key referencing the user who placed the order';
COMMENT ON COLUMN public.orders.status IS 'Current status of the order (e.g., pending_payment, paid, processing, shipped)';
COMMENT ON COLUMN public.orders.total_amount IS 'Total amount for the order, including all items';
COMMENT ON COLUMN public.orders.currency IS 'Currency of the order amount (default: USD)';
COMMENT ON COLUMN public.orders.payment_gateway IS 'Payment processor used (e.g., "stripe")';
COMMENT ON COLUMN public.orders.payment_intent_id IS 'Unique identifier from payment processor';
COMMENT ON COLUMN public.orders.shipping_address IS 'JSON containing shipping address details';
COMMENT ON COLUMN public.orders.billing_address IS 'JSON containing billing address details';
COMMENT ON COLUMN public.orders.tracking_number IS 'Shipping tracking number';
COMMENT ON COLUMN public.orders.notes IS 'Additional notes about the order';
COMMENT ON COLUMN public.orders.created_at IS 'Timestamp when the order was created';
COMMENT ON COLUMN public.orders.updated_at IS 'Timestamp when the order was last updated';

-- Enable Row Level Security for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders table
CREATE POLICY "Users can view their own orders" 
    ON public.orders FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" 
    ON public.orders FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- --------------------------------
-- Table: order_items
-- --------------------------------
-- Description: Details of items within an order
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    portrait_id UUID REFERENCES portraits(id) ON DELETE SET NULL,
    merchandise_id UUID REFERENCES merchandise(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    customization_details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.order_items IS 'Stores individual items within customer orders';
COMMENT ON COLUMN public.order_items.id IS 'Unique identifier for the order item';
COMMENT ON COLUMN public.order_items.order_id IS 'Foreign key referencing the parent order';
COMMENT ON COLUMN public.order_items.portrait_id IS 'Foreign key referencing the portrait (if portrait product)';
COMMENT ON COLUMN public.order_items.merchandise_id IS 'Foreign key referencing the merchandise type';
COMMENT ON COLUMN public.order_items.quantity IS 'Quantity of this item ordered';
COMMENT ON COLUMN public.order_items.unit_price IS 'Price per unit at time of order';
COMMENT ON COLUMN public.order_items.customization_details IS 'JSON data with customization details (e.g., portrait on mug)';
COMMENT ON COLUMN public.order_items.created_at IS 'Timestamp when the item was added to the order';

-- Enable Row Level Security for order_items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_items table - Based on order ownership
CREATE POLICY "Users can view their own order items" 
    ON public.order_items FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_id 
        AND orders.user_id = auth.uid()
    ));

-- --------------------------------
-- Table: feedback
-- --------------------------------
-- Description: Stores user-submitted feedback
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT,
    rating INTEGER,
    comment TEXT NOT NULL,
    page_url TEXT,
    status TEXT NOT NULL DEFAULT 'submitted',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.feedback IS 'Stores user-submitted feedback about the application';
COMMENT ON COLUMN public.feedback.id IS 'Unique identifier for the feedback';
COMMENT ON COLUMN public.feedback.user_id IS 'Foreign key referencing the user who submitted feedback (if logged in)';
COMMENT ON COLUMN public.feedback.email IS 'Email of the user if not logged in';
COMMENT ON COLUMN public.feedback.rating IS 'Numerical rating (e.g., 1-5 stars)';
COMMENT ON COLUMN public.feedback.comment IS 'Text feedback content';
COMMENT ON COLUMN public.feedback.page_url IS 'URL of the page where feedback was submitted';
COMMENT ON COLUMN public.feedback.status IS 'Status of feedback (e.g., submitted, reviewed, archived)';
COMMENT ON COLUMN public.feedback.created_at IS 'Timestamp when the feedback was submitted';

-- Enable Row Level Security for feedback
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for feedback table
CREATE POLICY "Users can view their own feedback" 
    ON public.feedback FOR SELECT 
    USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can submit feedback" 
    ON public.feedback FOR INSERT 
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- --------------------------------
-- Indexes for performance optimization
-- --------------------------------

-- Profile lookup by id (for joins)
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles (id);

-- User lookup by username
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles (username);

-- Pet lookup by user
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets (user_id);

-- Pet lookup by species
CREATE INDEX IF NOT EXISTS idx_pets_species ON public.pets (species);

-- Portrait lookup by user
CREATE INDEX IF NOT EXISTS idx_portraits_user_id ON public.portraits (user_id);

-- Portrait lookup by pet
CREATE INDEX IF NOT EXISTS idx_portraits_pet_id ON public.portraits (pet_id);

-- Portrait lookup by style
CREATE INDEX IF NOT EXISTS idx_portraits_style_id ON public.portraits (style_id);

-- Portrait lookup by status
CREATE INDEX IF NOT EXISTS idx_portraits_status ON public.portraits (status);

-- Order lookup by user
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);

-- Order lookup by status
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- Order item lookup by order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);

-- Custom function for updating timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at columns
CREATE TRIGGER update_pets_updated_at
BEFORE UPDATE ON public.pets
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_styles_updated_at
BEFORE UPDATE ON public.styles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customization_options_updated_at
BEFORE UPDATE ON public.customization_options
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portraits_updated_at
BEFORE UPDATE ON public.portraits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_merchandise_updated_at
BEFORE UPDATE ON public.merchandise
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

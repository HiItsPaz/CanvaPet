drop trigger if exists "update_customization_options_updated_at" on "public"."customization_options";

drop trigger if exists "update_merchandise_updated_at" on "public"."merchandise";

drop trigger if exists "trg_orders_audit" on "public"."orders";

drop trigger if exists "trg_orders_validate" on "public"."orders";

drop trigger if exists "trg_sync_shipping_address" on "public"."orders";

drop trigger if exists "trg_sync_shipping_address_insert" on "public"."orders";

drop trigger if exists "update_orders_updated_at" on "public"."orders";

drop trigger if exists "trg_pets_stats" on "public"."pets";

drop trigger if exists "trg_pets_validate" on "public"."pets";

drop trigger if exists "trg_safe_delete_pet" on "public"."pets";

drop trigger if exists "trg_validate_pet_coat" on "public"."pets";

drop trigger if exists "update_pets_updated_at" on "public"."pets";

drop trigger if exists "trg_portrait_auto_status" on "public"."portraits";

drop trigger if exists "trg_portraits_audit" on "public"."portraits";

drop trigger if exists "trg_portraits_stats" on "public"."portraits";

drop trigger if exists "trg_sync_portrait_image_urls" on "public"."portraits";

drop trigger if exists "update_portraits_updated_at" on "public"."portraits";

drop trigger if exists "update_profiles_updated_at" on "public"."profiles";

drop trigger if exists "update_styles_updated_at" on "public"."styles";

drop policy "Only admins can access audit logs" on "public"."audit_logs";

drop policy "Anyone can view active customization options" on "public"."customization_options";

drop policy "Users can submit feedback" on "public"."feedback";

drop policy "Users can view their own feedback" on "public"."feedback";

drop policy "Anyone can view active merchandise" on "public"."merchandise";

drop policy "Users can view their own order items" on "public"."order_items";

drop policy "Users can insert their own orders" on "public"."orders";

drop policy "Users can view their own orders" on "public"."orders";

drop policy "Users can view their own pet statistics" on "public"."pet_statistics";

drop policy "Users can insert their own pets" on "public"."pets";

drop policy "Users can view options applied to their portraits" on "public"."portrait_customization_options_applied";

drop policy "Public portraits can be viewed by anyone" on "public"."portraits";

drop policy "Users can delete their own portraits" on "public"."portraits";

drop policy "Users can insert their own portraits" on "public"."portraits";

drop policy "Users can update their own portraits" on "public"."portraits";

drop policy "Users can view their own portraits" on "public"."portraits";

drop policy "Anyone can view active styles" on "public"."styles";

drop policy "Users can update their own pets" on "public"."pets";

revoke delete on table "public"."audit_logs" from "anon";

revoke insert on table "public"."audit_logs" from "anon";

revoke references on table "public"."audit_logs" from "anon";

revoke select on table "public"."audit_logs" from "anon";

revoke trigger on table "public"."audit_logs" from "anon";

revoke truncate on table "public"."audit_logs" from "anon";

revoke update on table "public"."audit_logs" from "anon";

revoke delete on table "public"."audit_logs" from "authenticated";

revoke insert on table "public"."audit_logs" from "authenticated";

revoke references on table "public"."audit_logs" from "authenticated";

revoke select on table "public"."audit_logs" from "authenticated";

revoke trigger on table "public"."audit_logs" from "authenticated";

revoke truncate on table "public"."audit_logs" from "authenticated";

revoke update on table "public"."audit_logs" from "authenticated";

revoke delete on table "public"."audit_logs" from "service_role";

revoke insert on table "public"."audit_logs" from "service_role";

revoke references on table "public"."audit_logs" from "service_role";

revoke select on table "public"."audit_logs" from "service_role";

revoke trigger on table "public"."audit_logs" from "service_role";

revoke truncate on table "public"."audit_logs" from "service_role";

revoke update on table "public"."audit_logs" from "service_role";

revoke delete on table "public"."customization_options" from "anon";

revoke insert on table "public"."customization_options" from "anon";

revoke references on table "public"."customization_options" from "anon";

revoke select on table "public"."customization_options" from "anon";

revoke trigger on table "public"."customization_options" from "anon";

revoke truncate on table "public"."customization_options" from "anon";

revoke update on table "public"."customization_options" from "anon";

revoke delete on table "public"."customization_options" from "authenticated";

revoke insert on table "public"."customization_options" from "authenticated";

revoke references on table "public"."customization_options" from "authenticated";

revoke select on table "public"."customization_options" from "authenticated";

revoke trigger on table "public"."customization_options" from "authenticated";

revoke truncate on table "public"."customization_options" from "authenticated";

revoke update on table "public"."customization_options" from "authenticated";

revoke delete on table "public"."customization_options" from "service_role";

revoke insert on table "public"."customization_options" from "service_role";

revoke references on table "public"."customization_options" from "service_role";

revoke select on table "public"."customization_options" from "service_role";

revoke trigger on table "public"."customization_options" from "service_role";

revoke truncate on table "public"."customization_options" from "service_role";

revoke update on table "public"."customization_options" from "service_role";

revoke delete on table "public"."feedback" from "anon";

revoke insert on table "public"."feedback" from "anon";

revoke references on table "public"."feedback" from "anon";

revoke select on table "public"."feedback" from "anon";

revoke trigger on table "public"."feedback" from "anon";

revoke truncate on table "public"."feedback" from "anon";

revoke update on table "public"."feedback" from "anon";

revoke delete on table "public"."feedback" from "authenticated";

revoke insert on table "public"."feedback" from "authenticated";

revoke references on table "public"."feedback" from "authenticated";

revoke select on table "public"."feedback" from "authenticated";

revoke trigger on table "public"."feedback" from "authenticated";

revoke truncate on table "public"."feedback" from "authenticated";

revoke update on table "public"."feedback" from "authenticated";

revoke delete on table "public"."feedback" from "service_role";

revoke insert on table "public"."feedback" from "service_role";

revoke references on table "public"."feedback" from "service_role";

revoke select on table "public"."feedback" from "service_role";

revoke trigger on table "public"."feedback" from "service_role";

revoke truncate on table "public"."feedback" from "service_role";

revoke update on table "public"."feedback" from "service_role";

revoke delete on table "public"."merchandise" from "anon";

revoke insert on table "public"."merchandise" from "anon";

revoke references on table "public"."merchandise" from "anon";

revoke select on table "public"."merchandise" from "anon";

revoke trigger on table "public"."merchandise" from "anon";

revoke truncate on table "public"."merchandise" from "anon";

revoke update on table "public"."merchandise" from "anon";

revoke delete on table "public"."merchandise" from "authenticated";

revoke insert on table "public"."merchandise" from "authenticated";

revoke references on table "public"."merchandise" from "authenticated";

revoke select on table "public"."merchandise" from "authenticated";

revoke trigger on table "public"."merchandise" from "authenticated";

revoke truncate on table "public"."merchandise" from "authenticated";

revoke update on table "public"."merchandise" from "authenticated";

revoke delete on table "public"."merchandise" from "service_role";

revoke insert on table "public"."merchandise" from "service_role";

revoke references on table "public"."merchandise" from "service_role";

revoke select on table "public"."merchandise" from "service_role";

revoke trigger on table "public"."merchandise" from "service_role";

revoke truncate on table "public"."merchandise" from "service_role";

revoke update on table "public"."merchandise" from "service_role";

revoke delete on table "public"."order_items" from "anon";

revoke insert on table "public"."order_items" from "anon";

revoke references on table "public"."order_items" from "anon";

revoke select on table "public"."order_items" from "anon";

revoke trigger on table "public"."order_items" from "anon";

revoke truncate on table "public"."order_items" from "anon";

revoke update on table "public"."order_items" from "anon";

revoke delete on table "public"."order_items" from "authenticated";

revoke insert on table "public"."order_items" from "authenticated";

revoke references on table "public"."order_items" from "authenticated";

revoke select on table "public"."order_items" from "authenticated";

revoke trigger on table "public"."order_items" from "authenticated";

revoke truncate on table "public"."order_items" from "authenticated";

revoke update on table "public"."order_items" from "authenticated";

revoke delete on table "public"."order_items" from "service_role";

revoke insert on table "public"."order_items" from "service_role";

revoke references on table "public"."order_items" from "service_role";

revoke select on table "public"."order_items" from "service_role";

revoke trigger on table "public"."order_items" from "service_role";

revoke truncate on table "public"."order_items" from "service_role";

revoke update on table "public"."order_items" from "service_role";

revoke delete on table "public"."orders" from "anon";

revoke insert on table "public"."orders" from "anon";

revoke references on table "public"."orders" from "anon";

revoke select on table "public"."orders" from "anon";

revoke trigger on table "public"."orders" from "anon";

revoke truncate on table "public"."orders" from "anon";

revoke update on table "public"."orders" from "anon";

revoke delete on table "public"."orders" from "authenticated";

revoke insert on table "public"."orders" from "authenticated";

revoke references on table "public"."orders" from "authenticated";

revoke select on table "public"."orders" from "authenticated";

revoke trigger on table "public"."orders" from "authenticated";

revoke truncate on table "public"."orders" from "authenticated";

revoke update on table "public"."orders" from "authenticated";

revoke delete on table "public"."orders" from "service_role";

revoke insert on table "public"."orders" from "service_role";

revoke references on table "public"."orders" from "service_role";

revoke select on table "public"."orders" from "service_role";

revoke trigger on table "public"."orders" from "service_role";

revoke truncate on table "public"."orders" from "service_role";

revoke update on table "public"."orders" from "service_role";

revoke delete on table "public"."pet_statistics" from "anon";

revoke insert on table "public"."pet_statistics" from "anon";

revoke references on table "public"."pet_statistics" from "anon";

revoke select on table "public"."pet_statistics" from "anon";

revoke trigger on table "public"."pet_statistics" from "anon";

revoke truncate on table "public"."pet_statistics" from "anon";

revoke update on table "public"."pet_statistics" from "anon";

revoke delete on table "public"."pet_statistics" from "authenticated";

revoke insert on table "public"."pet_statistics" from "authenticated";

revoke references on table "public"."pet_statistics" from "authenticated";

revoke select on table "public"."pet_statistics" from "authenticated";

revoke trigger on table "public"."pet_statistics" from "authenticated";

revoke truncate on table "public"."pet_statistics" from "authenticated";

revoke update on table "public"."pet_statistics" from "authenticated";

revoke delete on table "public"."pet_statistics" from "service_role";

revoke insert on table "public"."pet_statistics" from "service_role";

revoke references on table "public"."pet_statistics" from "service_role";

revoke select on table "public"."pet_statistics" from "service_role";

revoke trigger on table "public"."pet_statistics" from "service_role";

revoke truncate on table "public"."pet_statistics" from "service_role";

revoke update on table "public"."pet_statistics" from "service_role";

revoke delete on table "public"."portrait_customization_options_applied" from "anon";

revoke insert on table "public"."portrait_customization_options_applied" from "anon";

revoke references on table "public"."portrait_customization_options_applied" from "anon";

revoke select on table "public"."portrait_customization_options_applied" from "anon";

revoke trigger on table "public"."portrait_customization_options_applied" from "anon";

revoke truncate on table "public"."portrait_customization_options_applied" from "anon";

revoke update on table "public"."portrait_customization_options_applied" from "anon";

revoke delete on table "public"."portrait_customization_options_applied" from "authenticated";

revoke insert on table "public"."portrait_customization_options_applied" from "authenticated";

revoke references on table "public"."portrait_customization_options_applied" from "authenticated";

revoke select on table "public"."portrait_customization_options_applied" from "authenticated";

revoke trigger on table "public"."portrait_customization_options_applied" from "authenticated";

revoke truncate on table "public"."portrait_customization_options_applied" from "authenticated";

revoke update on table "public"."portrait_customization_options_applied" from "authenticated";

revoke delete on table "public"."portrait_customization_options_applied" from "service_role";

revoke insert on table "public"."portrait_customization_options_applied" from "service_role";

revoke references on table "public"."portrait_customization_options_applied" from "service_role";

revoke select on table "public"."portrait_customization_options_applied" from "service_role";

revoke trigger on table "public"."portrait_customization_options_applied" from "service_role";

revoke truncate on table "public"."portrait_customization_options_applied" from "service_role";

revoke update on table "public"."portrait_customization_options_applied" from "service_role";

revoke delete on table "public"."portraits" from "anon";

revoke insert on table "public"."portraits" from "anon";

revoke references on table "public"."portraits" from "anon";

revoke select on table "public"."portraits" from "anon";

revoke trigger on table "public"."portraits" from "anon";

revoke truncate on table "public"."portraits" from "anon";

revoke update on table "public"."portraits" from "anon";

revoke delete on table "public"."portraits" from "authenticated";

revoke insert on table "public"."portraits" from "authenticated";

revoke references on table "public"."portraits" from "authenticated";

revoke select on table "public"."portraits" from "authenticated";

revoke trigger on table "public"."portraits" from "authenticated";

revoke truncate on table "public"."portraits" from "authenticated";

revoke update on table "public"."portraits" from "authenticated";

revoke delete on table "public"."portraits" from "service_role";

revoke insert on table "public"."portraits" from "service_role";

revoke references on table "public"."portraits" from "service_role";

revoke select on table "public"."portraits" from "service_role";

revoke trigger on table "public"."portraits" from "service_role";

revoke truncate on table "public"."portraits" from "service_role";

revoke update on table "public"."portraits" from "service_role";

revoke delete on table "public"."styles" from "anon";

revoke insert on table "public"."styles" from "anon";

revoke references on table "public"."styles" from "anon";

revoke select on table "public"."styles" from "anon";

revoke trigger on table "public"."styles" from "anon";

revoke truncate on table "public"."styles" from "anon";

revoke update on table "public"."styles" from "anon";

revoke delete on table "public"."styles" from "authenticated";

revoke insert on table "public"."styles" from "authenticated";

revoke references on table "public"."styles" from "authenticated";

revoke select on table "public"."styles" from "authenticated";

revoke trigger on table "public"."styles" from "authenticated";

revoke truncate on table "public"."styles" from "authenticated";

revoke update on table "public"."styles" from "authenticated";

revoke delete on table "public"."styles" from "service_role";

revoke insert on table "public"."styles" from "service_role";

revoke references on table "public"."styles" from "service_role";

revoke select on table "public"."styles" from "service_role";

revoke trigger on table "public"."styles" from "service_role";

revoke truncate on table "public"."styles" from "service_role";

revoke update on table "public"."styles" from "service_role";

alter table "public"."feedback" drop constraint "feedback_user_id_fkey";

alter table "public"."merchandise" drop constraint "merchandise_name_key";

alter table "public"."merchandise" drop constraint "merchandise_sku_key";

alter table "public"."order_items" drop constraint "order_items_merchandise_id_fkey";

alter table "public"."order_items" drop constraint "order_items_order_id_fkey";

alter table "public"."order_items" drop constraint "order_items_portrait_id_fkey";

alter table "public"."orders" drop constraint "orders_payment_intent_id_key";

alter table "public"."orders" drop constraint "orders_user_id_fkey";

alter table "public"."pet_statistics" drop constraint "pet_statistics_user_id_fkey";

alter table "public"."pets" drop constraint "check_pet_size";

alter table "public"."portrait_customization_options_applied" drop constraint "portrait_customization_options_app_customization_option_id_fkey";

alter table "public"."portrait_customization_options_applied" drop constraint "portrait_customization_options_applied_portrait_id_fkey";

alter table "public"."portraits" drop constraint "portraits_pet_id_fkey";

alter table "public"."portraits" drop constraint "portraits_style_id_fkey";

alter table "public"."portraits" drop constraint "portraits_user_id_fkey";

alter table "public"."styles" drop constraint "styles_name_key";

drop function if exists "public"."deactivate_user_data"(user_id_param uuid);

drop function if exists "public"."fn_audit_log"();

drop function if exists "public"."fn_auto_set_portrait_processing_flags"();

drop function if exists "public"."fn_cascade_user_status_to_pets"();

drop function if exists "public"."fn_create_profile_for_new_user"();

drop function if exists "public"."fn_safe_delete_pet"();

drop function if exists "public"."fn_sync_portrait_image_urls"();

drop function if exists "public"."fn_sync_shipping_address"();

drop function if exists "public"."fn_update_pet_stats"();

drop function if exists "public"."fn_update_portrait_stats"();

drop function if exists "public"."fn_validate_order"();

drop function if exists "public"."fn_validate_pet"();

drop function if exists "public"."fn_validate_pet_coat"();

drop view if exists "public"."portraits_legacy_view";

drop function if exists "public"."update_updated_at_column"();

alter table "public"."audit_logs" drop constraint "audit_logs_pkey";

alter table "public"."customization_options" drop constraint "customization_options_pkey";

alter table "public"."feedback" drop constraint "feedback_pkey";

alter table "public"."merchandise" drop constraint "merchandise_pkey";

alter table "public"."order_items" drop constraint "order_items_pkey";

alter table "public"."orders" drop constraint "orders_pkey";

alter table "public"."pet_statistics" drop constraint "pet_statistics_pkey";

alter table "public"."portrait_customization_options_applied" drop constraint "portrait_customization_options_applied_pkey";

alter table "public"."portraits" drop constraint "portraits_pkey";

alter table "public"."styles" drop constraint "styles_pkey";

drop index if exists "public"."audit_logs_pkey";

drop index if exists "public"."customization_options_pkey";

drop index if exists "public"."feedback_pkey";

drop index if exists "public"."idx_audit_logs_changed_at";

drop index if exists "public"."idx_audit_logs_table_record";

drop index if exists "public"."idx_customization_options_type";

drop index if exists "public"."idx_feedback_rating";

drop index if exists "public"."idx_feedback_status";

drop index if exists "public"."idx_feedback_user_id";

drop index if exists "public"."idx_merchandise_base_price";

drop index if exists "public"."idx_order_items_merchandise_id";

drop index if exists "public"."idx_order_items_order_id";

drop index if exists "public"."idx_order_items_portrait_id";

drop index if exists "public"."idx_orders_created_at";

drop index if exists "public"."idx_orders_status";

drop index if exists "public"."idx_orders_user_id";

drop index if exists "public"."idx_orders_user_status";

drop index if exists "public"."idx_pets_size_coat";

drop index if exists "public"."idx_pets_species";

drop index if exists "public"."idx_pets_user_id";

drop index if exists "public"."idx_pets_user_species";

drop index if exists "public"."idx_portraits_pet_id";

drop index if exists "public"."idx_portraits_public";

drop index if exists "public"."idx_portraits_status";

drop index if exists "public"."idx_portraits_style_id";

drop index if exists "public"."idx_portraits_user_id";

drop index if exists "public"."idx_portraits_user_status";

drop index if exists "public"."idx_profiles_id";

drop index if exists "public"."idx_profiles_username";

drop index if exists "public"."idx_styles_name";

drop index if exists "public"."merchandise_name_key";

drop index if exists "public"."merchandise_pkey";

drop index if exists "public"."merchandise_sku_key";

drop index if exists "public"."order_items_pkey";

drop index if exists "public"."orders_payment_intent_id_key";

drop index if exists "public"."orders_pkey";

drop index if exists "public"."pet_statistics_pkey";

drop index if exists "public"."portrait_customization_options_applied_pkey";

drop index if exists "public"."portraits_pkey";

drop index if exists "public"."styles_name_key";

drop index if exists "public"."styles_pkey";

drop table "public"."audit_logs";

drop table "public"."customization_options";

drop table "public"."feedback";

drop table "public"."merchandise";

drop table "public"."order_items";

drop table "public"."orders";

drop table "public"."pet_statistics";

drop table "public"."portrait_customization_options_applied";

drop table "public"."portraits";

drop table "public"."styles";

alter table "public"."pets" drop column "additional_image_urls";

alter table "public"."pets" drop column "age_years";

alter table "public"."pets" drop column "coat_color";

alter table "public"."pets" drop column "coat_type";

alter table "public"."pets" drop column "is_active";

alter table "public"."pets" drop column "original_image_url";

alter table "public"."pets" drop column "size";

alter table "public"."pets" drop column "updated_at";

alter table "public"."pets" add column "image_path" text;

alter table "public"."pets" add column "portrait_path" text;

alter table "public"."pets" alter column "created_at" set not null;

alter table "public"."profiles" drop column "created_at";

alter table "public"."profiles" alter column "updated_at" drop default;

create policy "Users can create their own pets"
on "public"."pets"
as permissive
for insert
to public
with check ((auth.uid() = user_id));


create policy "Users can update their own pets"
on "public"."pets"
as permissive
for update
to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));




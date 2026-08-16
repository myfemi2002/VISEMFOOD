# VISEMFOOD Product Document

## Project Name
**VISEMFOOD Premium Culinary, Catering, and Dynamic Admin Platform**

## Document Purpose
This product document defines the business goal, product scope, user flows, functional requirements, technical direction, and delivery expectations for the VISEMFOOD platform.

It is intended to align stakeholders, designers, and developers around one shared product vision before implementation begins.

## Product Summary
VISEMFOOD is a premium African food and hospitality brand that needs a fully dynamic website with a strong visual identity, an e-commerce-style food catalog, WhatsApp-based order confirmation, catering inquiry workflows, trays and coolers bulk ordering, and an admin backend for managing products, content, media, and inquiries.

The platform should combine brand presentation with practical conversion flows. Customers should be able to browse products like a modern food-commerce site, but final order confirmation and arrangement should happen through WhatsApp. The business should be able to update content, products, pricing, and settings from the admin panel without editing code.

## Product Vision
To build a premium digital hospitality platform that helps VISEMFOOD present its brand beautifully, convert visitors into customers, and manage day-to-day operations through a dynamic admin-controlled backend.

## Product Goals
1. Create a premium online presence for VISEMFOOD.
2. Provide an e-commerce-style `Order Now` experience for browsing meals.
3. Use WhatsApp as the final order confirmation and arrangement channel.
4. Support trays and coolers bulk ordering.
5. Capture and manage catering inquiries professionally.
6. Make all major content and product areas dynamic from the admin panel.
7. Support future expansion into payments, analytics, and customer accounts.

## Business Objectives
- Increase food order inquiries and conversions
- Improve catering lead capture
- Improve bulk order visibility
- Reduce dependency on developers for content updates
- Strengthen premium brand perception
- Build a scalable digital foundation for future growth

## Success Metrics
- Increase in product order inquiries from the `Order Now` page
- Increase in catering inquiry submissions
- Increase in trays and coolers order requests
- Reduced time required for staff to update products and content
- Improved response workflow for customer inquiries
- Stable admin usage for content and product management

## Target Users

### 1. Food Ordering Customer
This user wants to browse meals, view pricing, and quickly place an order.

### 2. Bulk Order Customer
This user wants trays, coolers, or party packages for a group or event.

### 3. Catering Customer
This user wants formal event catering and needs a more structured inquiry process.

### 4. Admin User
This user manages products, page content, inquiries, and settings from the backend.

## Core User Problems

### Customer Problems
- No clean digital way to browse available products
- No structured way to discover trays, coolers, and catering options
- No premium online experience that reflects the brand quality
- Unclear ordering flow if products are only shown informally on social platforms

### Business Problems
- Difficulty updating products and content quickly
- Inquiries may be scattered across channels
- No central backend for managing dynamic content and operations
- Limited visibility into customer demand categories

## Product Scope

### In Scope
- Fully dynamic customer-facing website
- E-commerce-style `Order Now` page
- Product detail pages
- Trays and coolers page
- Catering page
- Catering inquiry form
- Contact page
- Our Story page
- Admin dashboard
- Product and category management
- Dynamic page content management
- Cloudinary media configuration from admin
- WhatsApp order settings from admin

### Out of Scope for Phase One
- Native mobile app
- Full online payment checkout
- Customer account registration
- Loyalty system
- Advanced delivery/fleet integration
- Marketing automation

## Information Architecture

### Final Navbar
- `Home`
- `Order Now`
- `Trays & Coolers`
- `Catering`
- `Contact`
- `Our Story`

### Core Pages
- Homepage
- Order Now
- Product Detail
- Trays & Coolers
- Catering
- Catering Inquiry Form
- Contact
- Our Story

## Product Experience Overview

### Homepage
The homepage introduces the brand and directs users to the main journeys:
- food ordering
- bulk ordering
- catering
- contact and trust-building content

### Order Now
The `Order Now` page is the main dynamic catalog page. It should display all available products like an e-commerce food listing page.

Each product card should show:
- image
- name
- short description
- price
- category
- availability
- `Order Now` button

When the user clicks `Order Now`, WhatsApp should open with a pre-filled message that includes the selected product.

### Product Detail
This page gives fuller information about a single product and provides another `Order Now` button that leads to WhatsApp.

### Trays & Coolers
This page presents bulk packages for events, family gatherings, and celebrations. Clicking the CTA should open WhatsApp with the selected package details.

### Catering
This page presents the VISEMFOOD catering service and links the user to the catering inquiry form.

### Catering Inquiry Form
This page captures structured event details such as:
- name
- phone
- email
- event type
- event date
- guest count
- preferred menu
- notes

### Contact
This page supports general questions, support needs, and non-order communication.

### Our Story
This page communicates VISEMFOOD's identity, hospitality values, and brand heritage.

## Functional Requirements

### 1. Dynamic Product Management
Admin must be able to:
- add products
- edit products
- publish or unpublish products
- set featured products
- assign categories
- upload product images
- update price and availability

### 2. Dynamic Category Management
Admin must be able to:
- create categories
- reorder categories
- activate or deactivate categories

### 3. Dynamic Order Now Catalog
The system must:
- display products dynamically from the database
- support category-based filtering
- support search
- support product availability indicators
- support WhatsApp ordering from each product card

### 4. Product Detail Pages
The system must:
- generate dynamic product detail pages by slug
- show product media, description, and price
- support WhatsApp CTA from the product page

### 5. Trays and Coolers Management
Admin must be able to:
- create tray and cooler packages
- edit package content
- set pricing and serving range
- publish or unpublish packages

The frontend must:
- display packages dynamically
- support WhatsApp CTA per package

### 6. Catering Inquiry Management
The system must:
- provide a catering form
- store inquiries in the database
- allow admin review and status updates

### 7. Contact Inquiry Management
The system must:
- provide a contact form
- store messages in the database
- allow admin review and follow-up

### 8. Dynamic Content Management
Admin must be able to:
- edit homepage sections
- edit Our Story content
- edit service-related content
- edit CTA text and section visibility

### 9. WhatsApp Order Flow
The system must:
- open WhatsApp from each product CTA
- include product-specific message text
- open WhatsApp from trays and coolers packages
- allow WhatsApp number and templates to be edited from admin settings

### 10. Media Management
The system must:
- support Cloudinary-based media upload
- allow Cloudinary configuration from admin settings
- store media metadata in the database

### 11. Admin Dashboard
The admin dashboard should show:
- recent catering inquiries
- recent contact inquiries
- active bulk order requests
- quick links to products and content management

## Non-Functional Requirements

### Performance
- Pages should load quickly on desktop and mobile
- Product images should be optimized
- Public pages should be SEO-friendly

### Security
- Admin authentication required
- Cloudinary API secret stored encrypted
- Server-only handling of private credentials
- Role-based access for admin users if needed

### Scalability
- Architecture should support future payments, customer accounts, and analytics
- Content model should support adding new page sections later

### Usability
- Clean premium UI
- Easy product browsing
- Clear CTA hierarchy
- Simple admin workflows for non-technical users

## Technical Direction

### Recommended Stack
- Frontend: `Next.js`
- Backend: `Next.js full-stack on Node.js`
- Database: `MariaDB/MySQL`
- ORM: `Prisma`
- Styling: `Tailwind CSS`
- Media: `Cloudinary`
- Hosting: `Namecheap cPanel with Node.js`

### Technical Notes
- Build the site as one full-stack Next.js application
- Use dynamic database-backed content throughout
- Use Cloudinary for media delivery and uploads
- Use WhatsApp as the phase-one conversion endpoint for orders

## User Flows

### Food Ordering Flow
1. User opens `Order Now`
2. User browses products
3. User selects a product
4. User clicks `Order Now`
5. WhatsApp opens with pre-filled product message
6. Admin confirms payment and order arrangement

### Bulk Order Flow
1. User opens `Trays & Coolers`
2. User reviews package options
3. User clicks order CTA
4. WhatsApp opens with package message
5. Admin handles follow-up

### Catering Flow
1. User opens `Catering`
2. User reviews service information
3. User opens the inquiry form
4. User submits event details
5. Admin reviews and follows up

### Content Management Flow
1. Admin logs into dashboard
2. Admin edits products, packages, or page content
3. Changes are saved to the database
4. Frontend updates dynamically

## Admin Modules
- Dashboard
- Products
- Categories
- Trays & Coolers
- Catering Inquiries
- Contact Inquiries
- Website Content
- Media Settings
- WhatsApp Settings
- Site Settings

## Risks and Considerations
- WhatsApp ordering is simple and familiar, but it depends on timely manual admin response
- Product and pricing accuracy must be maintained by staff
- Media and content workflows should be easy enough for non-technical users
- Future payment integration may require order flow redesign

## Phase Plan

### Phase One
- Dynamic website
- `Order Now` catalog
- Product detail pages
- Trays & Coolers
- Catering and inquiry form
- Contact page
- Our Story page
- Admin dashboard
- Product/content/media/settings management

### Phase Two
- Managed order records
- online payment integration
- customer accounts
- reporting and analytics
- promotions and loyalty

## Deliverables
- Product catalog website
- Dynamic admin backend
- WhatsApp ordering flow
- Catering and contact inquiry workflows
- Cloudinary-powered media setup
- CMS-like page management
- Build-ready technical direction

## Acceptance Criteria
- Admin can add and update products without developer help
- `Order Now` page shows products dynamically
- Clicking product CTA opens WhatsApp with selected product text
- Admin can manage trays and coolers packages
- Admin can receive and manage catering inquiries
- Admin can update homepage and page content dynamically
- Cloudinary settings can be managed from admin

## Conclusion
The VISEMFOOD platform should be built as a dynamic premium hospitality website with a strong product catalog experience and a practical WhatsApp conversion flow. The system should balance visual quality, operational simplicity, and backend flexibility so the business can grow without rebuilding its digital foundation.

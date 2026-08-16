# VISEMFOOD Dynamic Features Breakdown

## Purpose
This document defines the dynamic features required for the VISEMFOOD platform so that the website is not static in nature. It outlines the backend-controlled modules, editable content areas, operational workflows, and data-driven sections that should be manageable without code changes.

## 1. Dynamic Product Management
The admin should be able to manage food items and ordering content directly from the backend.

### Admin Controls
- Add new products
- Edit existing products
- Delete or archive products
- Publish or unpublish products
- Mark products as featured
- Reorder product display positions

### Product Fields
- Product name
- Product slug
- Product category
- Short description
- Full description
- Price
- Portion or serving size
- Product image
- Availability status
- Featured status
- WhatsApp order message content

## 2. Dynamic Category Management
The platform should support flexible grouping of products and services.

### Admin Controls
- Create categories
- Edit category names
- Add category images if needed
- Reorder categories
- Activate or deactivate categories

### Example Categories
- Rice Dishes
- Soups
- Small Chops
- Trays & Coolers
- Catering Specials
- Drinks

## 3. Dynamic Homepage Management
The homepage should be editable from the backend so the team can update key sections regularly.

### Editable Homepage Sections
- Hero heading
- Hero subtext
- Hero background image
- Primary call-to-action text
- Secondary call-to-action text
- Featured products section
- Promotional banner content
- Testimonials or trust section
- About preview section
- Contact highlight section

## 3A. Dynamic Order Now Catalog Management
The `Order Now` page should function like an e-commerce catalog page, while still using WhatsApp as the final order confirmation channel.

### Admin Controls
- Display all active products automatically on the `Order Now` page
- Control which products appear as featured
- Reorder product positions
- Enable or disable product visibility
- Manage category filters
- Manage search behavior if included

### Catalog Features
- Product grid layout
- Product image
- Product name
- Short description
- Price
- Category label
- Availability status
- `Order Now` button on each product
- Click-through to product detail page

### Ordering Behavior
- Clicking `Order Now` should open WhatsApp
- The WhatsApp message should include the selected product name
- The message may also include price, quantity prompt, and greeting text

## 4. Dynamic Content Page Management
The following pages should allow backend content updates without touching code:

### Editable Pages
- Our Story
- Delivery Information
- Contact Us
- Catering Services
- Trays, Coolers & Bulk Orders

### Editable Content Blocks
- Page titles
- Introductory text
- Section headings
- Body content
- Images and banners
- FAQ items
- Service notes
- Call-to-action buttons

## 5. Dynamic Catering Inquiry Management
The system should store and manage incoming catering requests from the website.

### Admin Features
- View all inquiries
- Search inquiries
- Filter by date
- Filter by event type
- Filter by status
- Open full inquiry details
- Update inquiry status
- Add internal notes

### Inquiry Status Examples
- New
- Contacted
- In Review
- Confirmed
- Closed

### Inquiry Data Fields
- Customer name
- Phone number
- Email address
- Event type
- Event date
- Guest count
- Preferred menu
- Service type
- Additional notes
- Submission date

## 6. Dynamic Bulk Order Management
Bulk order requests should be manageable from the backend.

### Admin Features
- View bulk order requests
- Search orders
- Filter by status
- Update order progress
- Add internal notes
- View package selected
- View customer details

### Bulk Order Status Examples
- New
- Pending Confirmation
- Confirmed
- In Preparation
- Delivered
- Completed

## 7. Dynamic WhatsApp Order Flow Settings
Since the website uses WhatsApp for order confirmation and payment follow-up, those settings should also be dynamic.

### Admin Controls
- Update admin WhatsApp number
- Set default WhatsApp message template
- Customize product order message format
- Customize bulk order message format
- Customize catering follow-up message format

### Example Dynamic Message Data
- Product name
- Product price
- Quantity placeholder
- Customer name placeholder
- Order type

## 8. Dynamic Service and Order Information Management
Service-related ordering information should be editable from the backend and placed within the most relevant pages rather than a standalone delivery page.

### Admin Controls
- Update service notes shown on the `Order Now` page
- Update pickup instructions
- Update preparation time notes
- Update bulk order fulfillment notes
- Update order guidance and support text

## 9. Dynamic Contact Information Management
The business should be able to change support information easily.

### Editable Contact Items
- Business phone number
- WhatsApp number
- Email address
- Store address
- Opening hours
- Social media links

## 10. Dynamic Testimonials and Social Proof
If VISEMFOOD wants to showcase reviews or brand trust, these should be editable.

### Admin Controls
- Add testimonial
- Edit testimonial
- Remove testimonial
- Set featured testimonials

### Testimonial Fields
- Customer name
- Review text
- Customer image if needed
- Rating

## 11. Dynamic Media Management
The platform should support uploading and managing images used throughout the site.

### Media Features
- Upload product images
- Upload homepage banners
- Replace content page images
- Organize media library
- Delete unused images

## 12. Dynamic SEO and Metadata Management
Basic SEO settings should be editable for important pages.

### Editable SEO Fields
- Page title
- Meta description
- Open Graph image
- URL slug

## 13. Dashboard Overview Features
The admin dashboard should display live summaries from the dynamic data.

### Dashboard Widgets
- Total products
- Featured products
- New catering inquiries
- Active bulk orders
- Recent contact requests
- Quick links to manage homepage content

## 14. User Roles and Access Control
If needed, the backend can support different access levels.

### Possible Roles
- Super Admin
- Content Manager
- Operations Staff
- Customer Support Staff

## 15. Recommended Dynamic Scope for Phase One
The most important items to make dynamic in phase one are:

- Products and categories
- Homepage content
- Our Story page
- Delivery Information page
- Catering content
- Bulk order content
- Catering inquiry records
- Bulk order records
- WhatsApp order settings
- Contact details

## 16. Optional Phase Two Dynamic Features
These can be added later if required:

- Customer accounts
- Payment integration
- Promo code management
- Loyalty points
- Sales analytics
- Automated WhatsApp follow-ups
- Email notification workflows

## Conclusion
For VISEMFOOD to be fully dynamic, the platform should be built with a backend that allows the team to manage products, content, inquiries, bulk orders, and key operational settings without editing code. This will make the website easier to maintain, more scalable, and better aligned with the realities of a growing food and hospitality business.

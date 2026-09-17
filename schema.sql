-- schema.sql
-- Rachy's Eats & Treats Database Schema

CREATE TABLE IF NOT EXISTS packages (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  price TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Starter packages for Rachy's Eats & Treats
INSERT INTO packages (category, title, price, image_url, description, sort_order) VALUES
  ('Birthday Sets', 'Luxury Velvet Birthday Box', '₦45,000', 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop', 'Custom acrylic bubble balloon, fresh red roses, personalized sash, gourmet chocolate truffles, and celebration sparkler.', 1),
  ('Birthday Sets', 'Midnight Sparkle Balloon & Cake Set', '₦55,000', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800&auto=format&fit=crop', '4-inch bento celebration cake, chrome balloon bunch, sparkling cider, and gourmet chocolate-dipped strawberries.', 2),
  ('Birthday Sets', 'Sweet Celebration Mini Box', '₦25,000', 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop', 'Curated mini treat box featuring imported Belgian chocolates, personalized handwritten card, and mini helium balloon.', 3),
  ('Money Box Surprises', '3-Tier Pull-Out Money Tower', '₦35,000', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800&auto=format&fit=crop', 'Showstopping interactive pull-out money roll with clear cash sleeves, topped with fresh roses, chocolates, and custom greeting banner.', 1),
  ('Money Box Surprises', 'Velvet Exploding Surprise Box', '₦30,000', 'https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=800&auto=format&fit=crop', 'Quad-fold velvet keepsake box that bursts open with client photos, cash holders, sweet treats, and flutter butterfly inserts.', 2),
  ('Money Box Surprises', 'Royal Crown Cash & Treat Hamper', 'Priced on request', 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?q=80&w=800&auto=format&fit=crop', 'Opulent presentation basket integrating bespoke currency displays, non-alcoholic champagne, gold-rimmed tumbler, and pastries.', 3),
  ('Food Trays', 'The Lagos Executive Breakfast Tray', '₦38,000', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=800&auto=format&fit=crop', 'Golden Belgian waffles, seasoned scrambled eggs, chicken sausages, buttery croissants, fresh fruit cup, yogurt parfait, and freshly squeezed orange juice.', 1),
  ('Food Trays', 'Royal Brunch Feast & Mocktail Tray', '₦50,000', 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop', 'Fluffy buttermilk pancakes, maple syrup, grilled peppered wings, mini club sandwiches, fruit skewers, donuts, and chilled Chapman mocktail.', 2),
  ('Food Trays', 'Jollof & Grills Celebration Platter', '₦42,000', 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop', 'Smokey party Jollof rice, peppered turkey drumsticks, sweet fried dodo, spicy beef kebabs, coleslaw, and chilled hibiscus zobo drink.', 3),
  ('Hampers & Gift Boxes', 'Gentleman''s Premium Treat Box', '₦48,000', 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800&auto=format&fit=crop', 'Matte black keepsake chest with sparkling red grape drink, luxury body fragrance, cozy dress socks, leather wallet, and roasted cashew nuts.', 1),
  ('Hampers & Gift Boxes', 'Pamper & Glow Sweet Hamper', '₦40,000', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop', 'Organic rose water mist, scented soy wax candle, silky eye mask, Ferrero Rocher box, and personalized engraved hot/cold tumbler.', 2),
  ('Hampers & Gift Boxes', 'Grand Intention Luxury Hamper', '₦75,000', 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?q=80&w=800&auto=format&fit=crop', 'Our signature festive hamper packed with imported Danish butter cookies, sparkling wine, custom tumbler, artisan snacks, honey jar, and decorative floral bunch.', 3);

import { Link } from 'react-router-dom';
import { Phone, Mail, Facebook, Youtube, Linkedin, Instagram, Twitter, Shield } from 'lucide-react';
import swadeshiBadge from '@/assets/swadeshi-badge.png';
import equipmentBanner from '@/assets/equipment-banner.png';

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-8">
      {/* Equipment Banner - User uploaded image */}
      <div className="bg-background py-4">
        <img 
          src={equipmentBanner} 
          alt="ACE Equipment Range" 
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Payment Methods */}
      <div className="bg-card py-5 border-b border-border">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <p className="text-xs text-muted-foreground tracking-wide">
            100% SECURED PAYMENTS
          </p>
        </div>
        <div className="flex items-center justify-center gap-4 flex-wrap px-4">
          <img src="/images/payment/upi.svg" alt="UPI" className="h-8 object-contain" />
          <img src="/images/payment/visa.svg" alt="Visa" className="h-6 object-contain" />
          <img src="/images/payment/mastercard.svg" alt="Mastercard" className="h-8 object-contain" />
          <img src="/images/payment/amex.svg" alt="American Express" className="h-8 object-contain" />
          <div className="flex items-center gap-1 bg-muted px-3 py-1.5 rounded">
            <span className="text-xs font-semibold text-foreground">Net Banking</span>
          </div>
          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded">
            <span className="text-xs font-semibold text-primary">COD</span>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="px-5 py-6 space-y-6">
        {/* Connect Section */}
        <div>
          <h4 className="text-primary font-semibold text-sm mb-3">Connect with us</h4>
          <p className="text-primary text-xs mb-2">GOT QUESTIONS? CALL US</p>
          <a href="tel:1800180223" className="flex items-center gap-2 text-sm mb-2 text-background/90">
            <Phone className="w-4 h-4 text-primary" />
            1800-180-ACE
          </a>
          <a href="mailto:helpdesk@ace-cranes.com" className="flex items-center gap-2 text-sm text-background/90">
            <Mail className="w-4 h-4 text-primary" />
            helpdesk@ace-cranes.com
          </a>
          
          {/* Social Links */}
          <div className="flex items-center gap-3 mt-4">
            <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-primary font-semibold text-sm mb-3">Information</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/categories" className="hover:text-primary transition-colors">Categories</Link></li>
              <li><Link to="/machines" className="hover:text-primary transition-colors">My Machines</Link></li>
              <li><Link to="/dealer" className="hover:text-primary transition-colors">Dealer Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-primary font-semibold text-sm mb-3">Our Policy</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cancellation & Return</a></li>
            </ul>
          </div>
        </div>

        {/* Swadeshi Badge - Enlarged */}
        <div className="flex items-center justify-center pt-4 border-t border-background/10">
          <img 
            src={swadeshiBadge} 
            alt="100% Swadeshi" 
            className="h-20 w-auto object-contain"
          />
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-background/50 pt-2">
          © 2024 ACE (Action Construction Equipment Ltd). All rights reserved.
        </p>
      </div>
    </footer>
  );
};

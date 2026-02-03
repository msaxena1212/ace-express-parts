import { Link } from 'react-router-dom';
import { Phone, Mail, Facebook, Youtube, Linkedin, Instagram, Twitter, Shield, CreditCard, Wallet, Banknote } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background mt-8">
      {/* Equipment Banner */}
      <div className="bg-muted py-3 overflow-hidden">
        <div className="flex items-center justify-center gap-4 opacity-60">
          <img src="/images/equipment/crawler-cranes.png" alt="" className="h-12 object-contain" />
          <img src="/images/equipment/pick-carry-cranes.png" alt="" className="h-12 object-contain" />
          <img src="/images/equipment/tower-cranes.png" alt="" className="h-12 object-contain" />
          <img src="/images/equipment/fork-lift.png" alt="" className="h-12 object-contain" />
          <img src="/images/equipment/grader.png" alt="" className="h-12 object-contain" />
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-card py-4 border-b border-border">
        <p className="text-center text-xs text-muted-foreground tracking-widest mb-3">
          100% SECURED PAYMENTS WITH SSL SECURITY
        </p>
        <div className="flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-1">
            <Wallet className="w-6 h-6 text-primary" />
            <span className="text-xs text-muted-foreground">UPI</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <CreditCard className="w-6 h-6 text-primary" />
            <span className="text-xs text-muted-foreground">Cards</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xs text-muted-foreground">Net Banking</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Banknote className="w-6 h-6 text-primary" />
            <span className="text-xs text-muted-foreground">COD</span>
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

        {/* Swadeshi Badge */}
        <div className="flex items-center justify-center pt-4 border-t border-background/10">
          <div className="flex items-center gap-2 bg-background/5 px-4 py-2 rounded-lg">
            <span className="text-2xl font-bold text-primary">100%</span>
            <div className="text-left">
              <span className="text-xl font-bold text-primary">Swadeshi</span>
              <div className="flex gap-0.5">
                <div className="w-6 h-1 bg-primary rounded"></div>
                <div className="w-6 h-1 bg-background rounded"></div>
                <div className="w-6 h-1 bg-success rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-xs text-background/50 pt-2">
          © 2024 ACE (Action Construction Equipment Ltd). All rights reserved.
        </p>
      </div>
    </footer>
  );
};

/**
 * Valuation CTA Section
 * 
 * Call-to-action for property valuation requests
 */

import { Container } from "./Container";
import { Button } from "./Button";

export function ValuationCTA() {
  return (
    <section className="py-16 lg:py-20 bg-[#135C87] text-white">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <div className="h-[2px] w-12 bg-[#D9822B] mb-6 mx-auto" />
          
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            חושבים למכור את הנכס שלכם?
          </h2>
          
          <p className="text-xl text-white/90 mb-8">
            קבלו הערכת שווי מקצועית ללא התחייבות.
          </p>
          
          <Button 
            href="/contact" 
            variant="accent"
            size="lg"
            className="shadow-lg"
          >
            לקבלת הערכת שווי
          </Button>
        </div>
      </Container>
    </section>
  );
}

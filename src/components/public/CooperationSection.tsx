/**
 * Cooperation Section
 * 
 * Call-to-action for professional cooperation
 */

import { Container } from "./Container";
import { Button } from "./Button";

export function CooperationSection() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[#135C87] mb-4">
            מעוניינים בשיתוף פעולה?
          </h2>
          
          <p className="text-lg text-gray-600 mb-8">
            שיתופי פעולה מקצועיים עם משרדי תיווך, יזמים ומשקיעים.
            נשמח לשמוע ממכם ולבחון אפשרויות.
          </p>
          
          <Button 
            href="/contact" 
            variant="primary"
            size="lg"
          >
            בואו נדבר
          </Button>
        </div>
      </Container>
    </section>
  );
}

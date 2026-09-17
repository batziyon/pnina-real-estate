/**
 * Contact Section
 * 
 * Public contact CTA - form focused
 */

import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { Button } from "./Button";

export function ContactSection() {
  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <Container>
        <SectionHeading align="center" accentLine>
          צור קשר
        </SectionHeading>

        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg text-gray-600 mb-8">
            נשמח לעמוד לרשותכם בכל שאלה או בקשה
          </p>

          <Button 
            href="/contact" 
            variant="primary"
            size="lg"
          >
            שלחו הודעה
          </Button>
        </div>
      </Container>
    </section>
  );
}

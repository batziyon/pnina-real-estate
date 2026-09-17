/**
 * About Section - Public Homepage
 * 
 * Introduction to Pnina Real Estate
 */

import { Container } from "./Container";
import { SectionHeading } from "./SectionHeading";
import { Button } from "./Button";

export function AboutSection() {
  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <SectionHeading align="center" accentLine>
            קצת עליי
          </SectionHeading>
          
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            נעים להכיר, אני פנינה.
          </h3>
          
          <div className="text-lg text-gray-600 space-y-4 mb-8">
            <p>
              מתמחה בתיווך, שיווק ויזמות נדל״ן בירושלים.
            </p>
            <p>
              הכרות מעמיקה עם השכונות, השוק המקומי והמאפיינים הייחודיים של כל נכס.
            </p>
            <p>
              ליווי אישי מקצועי לאורך כל תהליך הרכישה או המכירה.
            </p>
          </div>
          
          <Button href="/about" variant="primary" size="lg">
            קראו עוד
          </Button>
        </div>
      </Container>
    </section>
  );
}

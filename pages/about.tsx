import React from 'react';
import { Container } from 'react-bootstrap';
import MainLayout from '../components/Layouts/MainLayout';
import styles from '../styles/about.module.scss';

const About = () => (
  <MainLayout hideJumbotron>
    <div className={styles.wrapper}>
      <Container className={styles.container}>
        <h1 className="text-center p-2">עלינו</h1>
        <p className="mt-4">
          שים eSim שמה לעצמה למטרה לספק חויית שירות איכותית וטובה, ולספק מבחר של
          אפשרויות רכישה במחירים כדאיים, של חבילות דאטא עבור גלישה בחו&quot;ל
        </p>
        <p>
          התחלנו את דרכנו בשנת 2022, כאשר כשוחרי טיולים וכמי שנהנים לנסוע ולטייל
          בחו&quot;ל, שמנו לב למחסור באפשררויות נוחות ובמחירים כדאיים עבור
          חבילות גלישה ושימוש בטלפון בזמן השהייה בחו&quot;ל
        </p>
        <p>
          הטכנולוגיות החדשות קיצרו את הדרך ליוזמה להציע חבילות גלישה בחו&quot;ל
          על בסיס כרטיס eSim, עליו ניתן להטעין מספר חבילות.
        </p>
        <p>
          העצמאות של לקוחותינו לצפות בפרטים על הזמנותיהם ולבצע פעולות בחשבונם
          ללא צורך בהמתנה לנציג שירות היא נר לרגלינו. עשינו מאמצים רבים להנגיש
          את כלל חוויית הרכישה והניהול, להפוך אותה לפשוטה ולמהירה ולאפשר לכם,
          הרוכשים, לנהל בעצמכם את החשבון ואת הפרטים שלכם.
        </p>
        <p>
          אנו עומלים כל עת כדי להוסיף אפשרויות חדשות ולבחון כיצד נוח לכם לגלוש
          באתר ולצרוך את השירותים שאנו מציעים. צפו לבאות!
        </p>
      </Container>
    </div>
  </MainLayout>
);

export default About;
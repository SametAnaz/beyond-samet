'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';
import styles from '../../styles/pages/about.module.css';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const scaleUp = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 100,
      duration: 0.5
    }
  }
};

const listItemVariant = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
};

export default function AboutPage() {
  // Scroll progress
  const { scrollYProgress } = useScroll();
  const progressScale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const progressOpacity = useTransform(scrollYProgress, [0, 0.3], [0.6, 1]);

  // Refs for scroll-triggered animations
  const educationRef = useRef(null);
  const skillsRef = useRef(null);
  const interestsRef = useRef(null);
  const contactRef = useRef(null);
  const cvRef = useRef(null);

  // InView states
  const educationInView = useInView(educationRef, { once: true, margin: "-100px 0px" });
  const skillsInView = useInView(skillsRef, { once: true, margin: "-100px 0px" });
  const interestsInView = useInView(interestsRef, { once: true, margin: "-100px 0px" });
  const contactInView = useInView(contactRef, { once: true, margin: "-100px 0px" });
  const cvInView = useInView(cvRef, { once: true });

  return (
    <motion.div 
      className={styles.container}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      style={{ 
        scale: progressScale,
        opacity: progressOpacity
      }}
    >
      <motion.h1 
        className={styles.title}
        variants={fadeIn}
      >
        Hakkımda
      </motion.h1>
      
      <motion.div 
        className={styles.profileSection}
        variants={fadeIn}
      >
        <motion.div 
          className={styles.profileImage}
          variants={scaleUp}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Image
            src="/assets/images/me5.png"
            alt="Samet Anaz"
            width={200}
            height={200}
            className={styles.avatar}
          />
        </motion.div>
        <motion.div 
          className={styles.profileInfo}
          variants={fadeIn}
        >
          <p className={styles.lead}>
            Merhaba! Ben <strong>Samet Anaz</strong>, Bilgisayar Mühendisliği 3. sınıf öğrencisi,
            geliştirici ve teknoloji meraklısıyım.
          </p>
        </motion.div>
      </motion.div>

      <motion.section 
        ref={educationRef}
        className={styles.section}
        initial={{ opacity: 0, y: 50 }}
        animate={educationInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.sectionTitle}>Eğitim ve Yolculuk</h2>
        <p>
          Recep Tayyip Erdoğan Üniversitesi'nde Bilgisayar Mühendisliği eğitimi alıyorum.
          Üniversiteye başladığımdan beri algoritma, veri yapıları, yapay zeka
          ve web teknolojileri üzerine çalışarak kendimi sürekli geliştiriyorum.
        </p>
      </motion.section>

      <motion.section 
        ref={skillsRef}
        className={styles.section}
        initial={{ opacity: 0, y: 50 }}
        animate={skillsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.sectionTitle}>Uzmanlık Alanlarım</h2>
        <motion.div 
          className={styles.skillsGrid}
          variants={staggerContainer}
          initial="hidden"
          animate={skillsInView ? "visible" : "hidden"}
        >
          <motion.div 
            className={styles.skillItem}
            variants={scaleUp}
            whileHover={{ y: -5 }}
          >
            <h3 className={styles.skillName}>Web Geliştirme</h3>
            <motion.ul 
              className={styles.skillList}
              variants={staggerContainer}
            >
              <motion.li variants={listItemVariant}>JavaScript (ES6+)</motion.li>
              <motion.li variants={listItemVariant}>React.js &amp; Next.js</motion.li>
              <motion.li variants={listItemVariant}>Node.js &amp; Express</motion.li>
              <motion.li variants={listItemVariant}>CSS3, CSS Modules &amp; Tailwind</motion.li>
            </motion.ul>
          </motion.div>
          <motion.div 
            className={styles.skillItem}
            variants={scaleUp}
            whileHover={{ y: -5 }}
          >
            <h3 className={styles.skillName}>Araçlar &amp; Teknolojiler</h3>
            <motion.ul 
              className={styles.skillList}
              variants={staggerContainer}
            >
              <motion.li variants={listItemVariant}>Git &amp; GitHub</motion.li>
              <motion.li variants={listItemVariant}>RESTful API Tasarımı</motion.li>
              <motion.li variants={listItemVariant}>MongoDB &amp; SQL</motion.li>
              <motion.li variants={listItemVariant}>AWS &amp; Vercel</motion.li>
            </motion.ul>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section 
        ref={interestsRef}
        className={styles.section}
        initial={{ opacity: 0, y: 50 }}
        animate={interestsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.sectionTitle}>İlgi Alanlarım</h2>
        <p>
          Açık kaynak projelere katkı sağlamak, IoT tabanlı uygulamalar geliştirmek, 
          yapay zeka destekli sistemler tasarlamak ve mobil uygulama geliştirmek
          temel ilgi alanlarım arasında yer alıyor. Ayrıca yeni programlama dilleri
          ve teknolojileri öğrenmekten büyük keyif alıyorum.
        </p>
      </motion.section>

      <motion.section 
        ref={contactRef}
        className={styles.section}
        initial={{ opacity: 0, y: 50 }}
        animate={contactInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className={styles.sectionTitle}>İletişim</h2>
        <p>
          Bana{" "}
          <motion.a
            href="mailto:sametanaz.tr@gmail.com"
            className={styles.link}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            sametanaz.tr@gmail.com
          </motion.a>{" "}
          adresinden veya sosyal medya hesaplarımdan ulaşabilirsiniz.
        </p>
      </motion.section>
      
      {/* CV Download Container */}
      <motion.section 
        ref={cvRef}
        className={styles.cvContainer}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={cvInView 
          ? { opacity: 1, scale: 1, y: 0 } 
          : { opacity: 0, scale: 0.9, y: 30 }
        }
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15, 
          delay: 0.1 
        }}
        whileHover={{ boxShadow: "0 5px 25px rgba(0,0,0,0.12)" }}
      >
        <div className={styles.cvContent}>
          <h2 className={styles.cvTitle}>Özgeçmişim</h2>
          <p className={styles.cvText}>
            Detaylı özgeçmişimi indirmek için aşağıdaki butona tıklayabilirsiniz.
          </p>
          <motion.a 
            href="/assets/docs/samet-anaz-cv.pdf" 
            download="Samet-Anaz-CV.pdf"
            className={styles.downloadButton}
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: "var(--accent-color-dark, #0056b3)",
              boxShadow: "0 5px 15px rgba(0, 0, 0, 0.2)"
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={cvInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.svg 
              className={styles.downloadIcon} 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              initial={{ y: -5 }}
              animate={{ y: 0 }}
              transition={{ 
                repeat: Infinity,
                repeatType: "reverse",
                duration: 1,
                ease: "easeInOut"
              }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </motion.svg>
            CV'yi İndir
          </motion.a>
        </div>
      </motion.section>
    </motion.div>
  );
} 
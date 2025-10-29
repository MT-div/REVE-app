import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import arrow from '@/assets/images/arrow.png';
import { useNavigation } from '@react-navigation/native';

const Term_n_policy = () => {
 const navigation = useNavigation();

 const [activeTab, setActiveTab] = useState('terms'); // حالة لتتبع التبويب النشط

 return (
   <View style={styles.container}>
     <StatusBar
       style="light"
       hidden={false}
       translucent={true}
       backgroundColor="#4D4FFF"
     />
     
     {/* Header Section */}
     <View style={styles.headerContainer}>
       <TouchableOpacity onPress={() => navigation.goBack()}>
         <Image source={arrow} style={styles.arrowIcon} />
       </TouchableOpacity>
       <Text style={styles.title}>بنود الخدمة والخصوصية</Text>
     </View>

     {/* Tabs Buttons */}
     <View style={styles.termsPolicyButtons}>
       <TouchableOpacity 
         style={[
           styles.tabButton, 
           activeTab === 'terms' && styles.activeTab
         ]}
         onPress={() => setActiveTab('terms')}
       >
         <Text style={[
           styles.tabText,
           activeTab === 'terms' && styles.activeTabText
         ]}>
           بنود الخدمة
         </Text>
       </TouchableOpacity>

       <TouchableOpacity 
         style={[
           styles.tabButton, 
           activeTab === 'policy' && styles.activeTab
         ]}
         onPress={() => setActiveTab('policy')}
       >
         <Text style={[
           styles.tabText,
           activeTab === 'policy' && styles.activeTabText
         ]}>
           الخصوصية
         </Text>
       </TouchableOpacity>
     </View>

     {/* Content Section */}
     <ScrollView style={styles.contentContainer}>
       {activeTab === 'terms' ? (
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>شروط الخدمة – RÊVE LLC</Text>
           <Text style={styles.updateDate}>آخر تحديث: [26-5-2025]</Text>
           <Text style={styles.sectionText}>
             مرحبًا بك في منصة RÊVE! عند استخدامك لخدماتنا، فإنك توافق على هذه الشروط والأحكام، لذا يرجى قراءتها بعناية.
           </Text>

           <Text style={styles.sectionText}>
             1. قبول الشروط{"\n"}
             عند استخدامك لمنصة RÊVE LLC، فإنك توافق على الالتزام بكافة البنود المذكورة هنا. إذا لم توافق على أي بند، يمكنك التوقف عن استخدام المنصة.
           </Text>

           <Text style={styles.sectionText}>
             2. الأهلية{"\n"}
             - يجب أن يكون عمر المستخدم 18 عامًا على الأقل للتسجيل كضيف (Guest).{"\n"}
             - يمكن للمضيف أن يكون:{"\n"}
             - مالك العقار.{"\n"}
             - وكيل قانوني مفوض بالتأجير بموجب اتفاق واضح.{"\n"}
             - لا تتحمل RÊVE LLC أي مسؤولية قانونية أو مالية بشأن العلاقات بين المالكين والوكلاء أو أي نزاعات قد تنشأ بينهم.
           </Text>

           <Text style={styles.sectionText}>
             3. وصف الخدمة{"\n"}
             تقدم RÊVE LLC سوقًا رقميًا متكاملًا يربط المضيفين بالضيوف لحجز العقارات قصيرة الأمد في سوريا، بما في ذلك الفلل والمزارع.{"\n"}
             تشمل الميزات:{"\n"}
             - عرض العقارات بجودة عالية.{"\n"}
             - إدارة الحجوزات بشكل مرن من "معلق" إلى "مؤكد".{"\n"}
             - معالجة مدفوعات آمنة.{"\n"}
             - التواصل المباشر بين الأطراف عبر المنصة.{"\n"}
             - ضمان الشفافية من خلال التقييمات المتبادلة.
           </Text>

           <Text style={styles.sectionText}>
             4. العروض الخاصة والعمولات والرسوم{"\n"}
             - يتم احتساب عمولة بنسبة 15% من القيمة الإجمالية للحجز يدفعها المضيف.{"\n"}
             - قد تطلق RÊVE حملات ترويجية يتم الإعلان عنها بوضوح، ويمكن خلالها تعديل أو إلغاء العمولة.{"\n"}
             - تحتفظ RÊVE بحق تعديل نسبة العمولة مع إخطار المستخدمين قبل 5 أيام من تنفيذ التغيير.
           </Text>

           <Text style={styles.sectionText}>
             5. عملية الحجز والدفع{"\n"}
             خطوات الحجز:{"\n"}
             - يرسل الضيف طلب الحجز ← يصبح "معلقًا".{"\n"}
             - عند الدفع، يتحول الحجز إلى "مؤكد"، مع إغلاق 50% من المبلغ الإجمالي.{"\n"}
             - يتم تحويل باقي المبلغ إلى المضيف وفق سياسة الدفع المتبعة.{"\n"}
             - يتم سداد الجزء المتبقي بنسبة 50% وفق الاتفاق، إما عند الوصول أو عند المغادرة.
           </Text>

           <Text style={styles.sectionText}>
             6. سياسة الإلغاء والاسترداد{"\n"}
             - استرداد كامل للمبلغ في حالة الإلغاء قبل 10 أيام من تاريخ الوصول.{"\n"}
             - في حال الإلغاء خلال أقل من 10 أيام، لا يتم استرداد أي مبلغ باستثناء الحالات القاهرة (الأوبئة، الحروب، الكوارث...).{"\n"}
             - إذا تم إلغاء الحجز من قبل الضيف خلال أقل من 10 أيام، فلن يتم استرداد قيمة الدفعة الأولى.{"\n"}
             - إذا قام ضيف آخر بحجز نفس العقار خلال نفس الفترة، فسيتم استرداد 50% من الدفعة الأولى.{"\n"}
             - أي رسوم تحويل أو معالجة مصرفية يتم خصمها من مبلغ الاسترداد.{"\n"}
             - تهدف هذه الإجراءات إلى حماية المضيفين من الخسائر الناتجة عن الإلغاءات المتأخرة مع ضمان المرونة.{"\n"}
             - إذا تم تعويض الحجز بشخص آخر، فسيتم استرداد المبلغ بالكامل للضيف.{"\n"}
             - لا تتحمل RÊVE أي مسؤولية عن تأخيرات أو ظروف شخصية خاصة بالضيف.{"\n"}
             - في حالة إلغاء الحجز المؤكد من قبل المضيف، يجب رد المبلغ بالكامل للضيف.{"\n"}
             - إذا لم يتمكن الضيف من الوصول إلى مكان الحجز بسبب ظروف قاهرة، يحق له إلغاء الحجز دون تحمل مسؤولية، وسيتم رد المبلغ بالكامل.
           </Text>

           <Text style={styles.sectionText}>
             7. التزامات المستخدمين{"\n"}
             التزامات الضيوف:{"\n"}
             - الالتزام بالحد الأدنى للسن وهو 18 عامًا.{"\n"}
             - عدم ممارسة أي نشاط غير قانوني (احتيال، مخدرات، أعمال مشبوهة).{"\n"}
             - احترام مواعيد الدخول والخروج.{"\n"}
             - استخدام العقار بطريقة مسؤولة دون التسبب في إزعاج أو ضرر.{"\n"}
             - تحمل المسؤولية عن أي تلفيات مادية أو شكاوى من الجيران.{"\n"}
             الالتزامات المضيفين:{"\n"}
             - إثبات ملكية العقار أو الحصول على تصريح بالتأجير.{"\n"}
             - تقديم وصف دقيق للخدمات والمواصفات.{"\n"}
             - المحافظة على نظافة وجودة الضيافة.{"\n"}
             - الامتناع عن تقديم معلومات أو صور مضللة.{"\n"}
             تشجع RÊVE جميع المستخدمين على الإبلاغ عن أي نشاط مشبوه أو غير قانوني، لكنها غير مسؤولة عن النزاعات المالية أو القانونية بين المضيفين والضيوف، ويمكنها التدخل في حل النزاعات عبر الوساطة.
           </Text>

           <Text style={styles.sectionText}>
             8. المحتوى والاستخدام المقبول{"\n"}
             يحظر استخدام المنصة في الحالات التالية:{"\n"}
             - انتحال الشخصيات.{"\n"}
             - تقديم معلومات مزيفة.{"\n"}
             - نشر محتوى غير مصرح به.{"\n"}
             - إرسال رسائل مزعجة أو ضارة.{"\n"}
             جميع المحتويات داخل RÊVE، بما في ذلك الشعارات والتصاميم والصور، تعتبر ملكية فكرية ولا يجوز استخدامها بدون إذن خطي.
           </Text>

           <Text style={styles.sectionText}>
             9. الإنهاء والتعليق{"\n"}
             تحتفظ RÊVE LLC بحق تعليق أو إلغاء حساب أي مستخدم في الحالات التالية:{"\n"}
             - تقديم بيانات خاطئة.{"\n"}
             - إساءة استخدام المنصة.{"\n"}
             - الإخلال بأي شرط من الشروط.{"\n"}
             - تلقي شكاوى موثوقة من مستخدمين آخرين.
           </Text>

           <Text style={styles.sectionText}>
             10. حل النزاعات{"\n"}
             - يوافق الطرفان أولًا على محاولة حل أي نزاع وديًا.{"\n"}
             - إذا لم يتم التوصل إلى حل خلال 30 يومًا، يمكن اللجوء إلى المحاكم المختصة في دمشق – سوريا.
           </Text>

           <Text style={styles.sectionText}>
             11. تعديل الشروط{"\n"}
             - يمكن لـ RÊVE تعديل هذه الشروط في أي وقت.{"\n"}
             - تصبح التعديلات نافذة بعد 5 أيام من نشرها أو إخطار المستخدمين بها عبر البريد الإلكتروني.
           </Text>

           <Text style={styles.sectionText}>
             12. القانون المعتمد والتواصل{"\n"}
             - تخضع هذه الاتفاقية للقانون السوري.{"\n"}
             - للتواصل: reve.local@gmail.com{"\n"}
             - العنوان: دمشق، الجمهورية العربية السورية.
           </Text>

           {/* English Version */}
              <Text style={styles.EsectionTitle}>Terms of Service – RÊVE LLC</Text>
           <Text style={styles.EupdateDate}> Last Updated: May 26, 202</Text>
           <Text style={styles.EsectionText}>
             Welcome to RÊVE! By using our services, you agree to these terms and conditions, so please read them carefully.
           </Text>

           <Text style={styles.EsectionText}>
             Terms of Service – RÊVE LLC{"\n"}
             Last Updated: May 26, 2025{"\n"}
             Welcome to RÊVE! By using our services, you agree to these terms and conditions, so please read them carefully.
           </Text>

           <Text style={styles.EsectionText}>
             1. Acceptance of Terms{"\n"}
             By using the services provided by RÊVE LLC, you agree to comply with all the terms stated herein. If you do not agree to any term, you may stop using the platform.
           </Text>

           <Text style={styles.EsectionText}>
             2. Eligibility{"\n"}
             - Users must be at least 18 years old to register as a guest.{"\n"}
             - A host may be:{"\n"}
             - The property owner.{"\n"}
             - A legally authorized agent acting under a clear agreement.{"\n"}
             - RÊVE LLC assumes no legal or financial responsibility regarding the relationships between owners and agents or any disputes that may arise between them.
           </Text>

           <Text style={styles.EsectionText}>
             3. Service Description{"\n"}
             RÊVE LLC offers a comprehensive digital marketplace connecting hosts with guests for short-term property rentals in Syria, including villas and farms.{"\n"}
             Key features include:{"\n"}
             - High-quality property listings.{"\n"}
             - Flexible booking management from "Pending" to "Confirmed."{"\n"}
             - Secure payment processing.{"\n"}
             - Direct communication between parties through the platform.{"\n"}
             - Transparency through mutual ratings.
           </Text>

           <Text style={styles.EsectionText}>
             4. Promotions, Commissions & Fees{"\n"}
             - A 15% commission is charged to the host based on the total booking amount.{"\n"}
             - RÊVE may launch promotional campaigns that are clearly announced, allowing for commission adjustments or waivers.{"\n"}
             - RÊVE reserves the right to modify the commission rate with a 5-day notice to users.
           </Text>

           <Text style={styles.EsectionText}>
             5. Booking & Payment Process{"\n"}
             Booking steps:{"\n"}
             - The guest sends a booking request → status becomes "Pending."{"\n"}
             - Upon payment, the booking becomes "Confirmed," securing 50% of the total amount.{"\n"}
             - The remaining amount is transferred to the host according to the payment policy.{"\n"}
             - The remaining 50% is paid according to the agreement, either upon arrival or departure.
           </Text>

           <Text style={styles.EsectionText}>
             6. Cancellation & Refund Policy{"\n"}
             - Full refund for cancellations made 10 days or more before check-in.{"\n"}
             - No refund is issued for cancellations made less than 10 days prior to check-in, except in cases of force majeure (natural disasters, war, pandemics...).{"\n"}
             - If a guest cancels less than 10 days before check-in, the 50% advance is non-refundable by default. However, if the same dates are successfully rebooked by another guest, the original guest will be refunded their payment (minus any applicable bank or processing fees).{"\n"}
             - RÊVE is not responsible for delays or personal circumstances affecting the guest.{"\n"}
             - If the host cancels a confirmed booking, the full amount must be refunded to the guest.{"\n"}
             - If the host is unable to fulfill the booking due to force majeure, they may cancel without penalty, and the full amount will be refunded to the guest.
           </Text>

           <Text style={styles.EsectionText}>
             7. User Responsibilities{"\n"}
             Guest obligations:{"\n"}
             - Must be at least 18 years old.{"\n"}
             - No engagement in illegal activities (e.g., drugs, vandalism, prostitution).{"\n"}
             - Respect agreed check-in and check-out times.{"\n"}
             - Use the property responsibly, avoiding damages or disturbances.{"\n"}
             - Guests are liable for any damages or complaints reported by neighbors.{"\n"}
             Host obligations:{"\n"}
             - Must verify identity and ownership or provide legal authorization to rent.{"\n"}
             - Accurately present property details and offered services.{"\n"}
             - Maintain hospitality standards and cleanliness.{"\n"}
             - Refrain from providing misleading information or images.{"\n"}
             RÊVE encourages all users to report suspicious or fraudulent activity. RÊVE is not legally responsible for financial or contractual disputes between hosts and guests, or between property owners and agents. However, the platform may act as a mediator to help resolve such conflicts when necessary.
           </Text>

           <Text style={styles.EsectionText}>
             8. Acceptable Use & Content Policy{"\n"}
             The platform may not be used for:{"\n"}
             - Identity fraud or impersonation.{"\n"}
             - Providing false or misleading information.{"\n"}
             - Uploading unauthorized or copyrighted content.{"\n"}
             - Sending spam or malicious content.{"\n"}
             All content on RÊVE, including photos, branding, and design elements, is protected intellectual property and may not be used without explicit written permission.
           </Text>

           <Text style={styles.EsectionText}>
             9. Account Suspension or Termination{"\n"}
             RÊVE LLC reserves the right to suspend or terminate any user account in the following cases:{"\n"}
             - Submission of false or misleading information.{"\n"}
             - Misuse of the platform.{"\n"}
             - Violation of these Terms of Service.{"\n"}
             - Receiving credible user complaints.
           </Text>

           <Text style={styles.EsectionText}>
             10. Dispute Resolution{"\n"}
             Both parties agree to first attempt to resolve any disputes amicably.{"\n"}
             If no resolution is reached within 30 days, legal action may be pursued before the competent courts in Damascus, Syria.
           </Text>

           <Text style={styles.EsectionText}>
             11. Changes to the Terms{"\n"}
             RÊVE may modify these terms at any time.{"\n"}
             Changes become effective 5 days after being published and users are notified via email or in-app announcement.
           </Text>

           <Text style={styles.EsectionText}>
             12. Governing Law & Contact Information{"\n"}
             This Agreement is governed by the laws of the Syrian Arab Republic.{"\n"}
             Contact: reve.local@gmail.com{"\n"}
             Address: Damascus – Syrian Arab Republic.
           </Text>
         </View>
       ) : (
         <View style={styles.section}>
            <Text style={styles.sectionTitle}>سياسة الخصوصية – RÊVE LLC</Text>
            <Text style={styles.updateDate}>تاريخ التفعيل: تدخل هذه السياسة حيز التنفيذ بعد خمسة أيام من نشرها.</Text>
            <Text style={styles.sectionText}>
              في RÊVE، نولي أهمية كبيرة لخصوصيتك، ونوضح في هذه الوثيقة كيفية جمع بياناتك واستخدامها وحمايتها وفقًا لأفضل الممارسات القانونية والدولية في حماية البيانات.
            </Text>

            <Text style={styles.sectionText}>
              1. البيانات التي نجمعها{"\n"}
              البيانات التي تقدمها مباشرة:{"\n"}
              - الاسم الكامل، رقم الهاتف، البريد الإلكتروني.{"\n"}
              - وثائق إثبات الهوية (للمضيفين).{"\n"}
              - بيانات الحساب البنكي أو المحافظ الإلكترونية للدفع.{"\n"}
              - مواصفات العقارات المعروضة وصورها (للمضيفين).{"\n"}
              - معلومات الحجوزات والمراسلات.{"\n"}
              البيانات التي يتم جمعها تلقائيًا:{"\n"}
              - بيانات الجهاز ونظام التشغيل والمتصفح المستخدم.{"\n"}
              - عنوان IP والموقع الجغرافي (عند الموافقة).{"\n"}
              - سجل النشاط على المنصة (الصفحات التي تمت زيارتها، مدة التصفح).{"\n"}
              - ملفات تعريف الارتباط Cookies وتقنيات التتبع الأخرى.
            </Text>

            <Text style={styles.sectionText}>
              2. كيفية استخدام بياناتك{"\n"}
              يتم استخدام البيانات التي نجمعها للأغراض التالية:{"\n"}
              - تقديم الخدمات وإنشاء الحسابات.{"\n"}
              - تأكيد الحجوزات وإرسال الإشعارات المرتبطة بها.{"\n"}
              - تحسين تجربة المستخدم وتطوير المنصة.{"\n"}
              - التحقق من الهوية والتأكد من ملكية العقارات.{"\n"}
              - تسهيل التواصل بين الضيوف والمضيفين.{"\n"}
              - التحليل والإحصائيات التشغيلية.{"\n"}
              - إرسال العروض الترويجية والتحديثات (بموافقتك).
            </Text>

            <Text style={styles.sectionText}>
              3. حماية البيانات{"\n"}
              نلتزم بحماية بياناتك من خلال:{"\n"}
              - فرض قيود صارمة على الوصول الداخلي إلى البيانات.{"\n"}
              - مراجعات دورية لتقييم المخاطر الأمنية وسد الثغرات.{"\n"}
              على الرغم من أننا نتخذ جميع الاحتياطات لحماية بياناتك، لا يمكننا ضمان الأمان الكامل عبر الإنترنت بسبب مخاطر الاختراق وسرقة البيانات.
            </Text>

            <Text style={styles.sectionText}>
              4. مشاركة بياناتك{"\n"}
              يتم مشاركة بياناتك فقط في الحالات التالية:{"\n"}
              - تفاصيل الحجز المؤكد بين الضيف والمضيف.{"\n"}
              - مع مزودي خدمات الدفع والتوثيق والبنية التحتية التقنية.{"\n"}
              - مع الجهات القانونية أو الحكومية إذا كان هناك طلب رسمي.{"\n"}
              لن نبيع أو نشارك بياناتك مع أطراف ثالثة لأغراض تجارية دون موافقتك الصريحة.
            </Text>

            <Text style={styles.sectionText}>
              5. الاحتفاظ بالبيانات{"\n"}
              نحتفظ ببياناتك طالما كان ذلك ضروريًا لتقديم الخدمات، أو وفقًا لما يفرضه القانون.{"\n"}
              عند إغلاق الحساب، نقوم بحذف أو إخفاء بياناتك إلا إذا كان الاحتفاظ بها مطلوبًا لأغراض قانونية أو تنظيمية.
            </Text>

            <Text style={styles.sectionText}>
              6. الإشعارات والتسويق{"\n"}
              لن نقوم بإرسال إشعارات أو عروض ترويجية إلا بموافقتك.{"\n"}
              يمكنك إلغاء الاشتراك في أي وقت من خلال رابط موجود في البريد الإلكتروني.
            </Text>

            <Text style={styles.sectionText}>
              7. حقوق المستخدم{"\n"}
              يحق لك:{"\n"}
              - الوصول إلى بياناتك الشخصية.{"\n"}
              - تصحيح أو تعديل بياناتك.{"\n"}
              - طلب حذف حسابك والبيانات المرتبطة به.{"\n"}
              - الاعتراض على استخدام بياناتك لأغراض تسويقية.{"\n"}
              - طلب نقل بياناتك إلى جهة أخرى (إن أمكن).{"\n"}
              للممارسة أي من هذه الحقوق، يرجى التواصل معنا عبر البريد الإلكتروني المذكور أدناه.
            </Text>

            <Text style={styles.sectionText}>
              8. سياسة الأطفال{"\n"}
              خدماتنا غير موجهة للأطفال دون سن 18 عامًا، ولا نقوم بجمع بيانات القُصّر عمدًا.{"\n"}
              في حال اكتشاف بيانات تعود لقاصر دون موافقة قانونية، سيتم حذفها فورًا.
            </Text>

            <Text style={styles.sectionText}>
              9. تعديلات سياسة الخصوصية{"\n"}
              نحتفظ بحق تعديل هذه السياسة في أي وقت، وسنقوم بإخطار المستخدمين قبل خمسة أيام من دخول التغييرات حيز التنفيذ عبر البريد الإلكتروني أو داخل التطبيق.
            </Text>

            <Text style={styles.sectionText}>
              10. التواصل معنا{"\n"}
              للأسئلة أو الشكاوى المتعلقة بسياسة الخصوصية، يرجى التواصل معنا عبر:{"\n"}
              - البريد الإلكتروني: reve.local@gmail.com{"\n"}
              - العنوان: دمشق – الجمهورية العربية السورية.
            </Text>

            {/* English Version */}
           

            <Text style={styles.EsectionTitle}>Privacy Policy – RÊVE LLC</Text>
            <Text style={styles.EupdateDate}>Effective Date: This policy becomes effective five days after being published.{"\n"}
              Last Updated: May 26, 2025</Text>
            <Text style={styles.EsectionText}>
              At RÊVE LLC, we are committed to protecting your personal data and maintaining your trust. This Privacy Policy explains how we collect, use, share, and protect your personal information in connection with our services.
            </Text>
            <Text style={styles.EsectionText}>
              1. Information We Collect{"\n"}
              Information You Provide:{"\n"}
              - Full name, phone number, and email address.{"\n"}
              - Property images and specifications (for Hosts).{"\n"}
              - Booking history and user communications.{"\n"}
              Information Collected Automatically:{"\n"}
              - Device type, operating system, and browser type.{"\n"}
              - IP address and geolocation data (with permission).{"\n"}
              - Usage logs, activity timestamps, and interaction history.{"\n"}
              - Cookies and similar tracking technologies.
            </Text>

            <Text style={styles.EsectionText}>
              2. How We Use Your Information{"\n"}
              We use your data to:{"\n"}
              - Create and manage your account.{"\n"}
              - Send booking confirmations and notifications.{"\n"}
              - Enhance the platform experience and features.{"\n"}
              - Verify user identity and property ownership.{"\n"}
              - Facilitate communication between Guests and Hosts.{"\n"}
              - Generate operational insights and analytics.{"\n"}
              - Send promotional content (with your consent).
            </Text>

            <Text style={styles.EsectionText}>
              3. Data Security{"\n"}
              We implement strong technical and organizational safeguards to protect your data:{"\n"}
              - Strict internal access controls.{"\n"}
              - Regular audits and security risk assessments.{"\n"}
              However, no system is fully immune to online threats, and we encourage users to follow personal safety practices (e.g., never share passwords).
            </Text>

            <Text style={styles.EsectionText}>
              4. When We Share Your Information{"\n"}
              Your information may be shared under these conditions:{"\n"}
              - With other users for booking confirmation purposes.{"\n"}
              - With trusted service providers (e.g., payment processors, infrastructure partners).{"\n"}
              - With legal authorities upon lawful request.{"\n"}
              - With marketing or analytics providers in an anonymized format.{"\n"}
              We do not sell your personal information to third parties without your explicit consent.
            </Text>

            <Text style={styles.EsectionText}>
              5. Data Retention{"\n"}
              We retain your data for as long as necessary to provide our services or comply with legal obligations.{"\n"}
              Upon account closure, we delete or anonymize your personal data unless retention is legally required.
            </Text>

            <Text style={styles.EsectionText}>
              6. Marketing & Notifications{"\n"}
              We may send you marketing messages only if you opt in.{"\n"}
              You may unsubscribe at any time by clicking the “unsubscribe” link in our emails.
            </Text>

            <Text style={styles.EsectionText}>
              7. Your Rights{"\n"}
              You have the right to:{"\n"}
              - Access the personal data we hold about you.{"\n"}
              - Request correction of inaccurate information.{"\n"}
              - Request deletion of your account and data.{"\n"}
              - Object to data processing for marketing purposes.{"\n"}
              - Request a copy of your data (where applicable).{"\n"}
              To exercise your rights, contact us using the details below.
            </Text>

            <Text style={styles.EsectionText}>
              8. Children’s Privacy{"\n"}
              Our services are not intended for individuals under the age of 18. If we discover we’ve collected personal data from a minor, we will delete it promptly.
            </Text>

            <Text style={styles.EsectionText}>
              9. Policy Updates{"\n"}
              We reserve the right to update this Privacy Policy at any time. Significant changes will be communicated at least five days before they take effect, via in-app notification or email.
            </Text>

            <Text style={styles.EsectionText}>
              10. Contact Us{"\n"}
              For questions, concerns, or requests regarding this Privacy Policy:{"\n"}
              Email: reve.local@gmail.com{"\n"}
              Address: Damascus, Syrian Arab Republic.
            </Text>
             </View>
       )}
     </ScrollView>
   </View>
 );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  
  headerContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(149, 147, 147, 0.69)',
    paddingBottom: 10,
    paddingTop: 30,
    backgroundColor: '#4D4FFF',
  },
  title: {
    fontSize: 22,
    textAlign: 'right',
    marginTop: -8,
    fontFamily: 'NotoKufiArabic-Bold',
  },
  arrowIcon: {
    width: 40,
    height: 40,
  },
  termsPolicyButtons: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    backgroundColor: '#FFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    backgroundColor: '#E0E0E0',
  },
  activeTab: {
    backgroundColor: '#4D4FFF',
  },
  tabText: {
    fontFamily: 'NotoKufiArabic-Medium',
    fontSize: 16,
    color: '#333',
  },
  activeTabText: {
    color: 'white',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  
  section: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  updateDate:{
        fontFamily: 'NotoKufiArabic-Bold',
    fontSize: 17,
    color: '#4D4FFF',
    marginBottom: 15,
    textAlign: 'right',
  },
  EupdateDate:{
        fontFamily: 'NotoKufiArabic-Bold',
    fontSize: 17,
    color: '#4D4FFF',
    marginBottom: 15,
    textAlign: 'left',
  },
  
  sectionTitle: {
    fontFamily: 'NotoKufiArabic-Bold',
    fontSize: 20,
    color: '#4D4FFF',
    marginBottom: 15,
    textAlign: 'right',
  },

  EsectionTitle: {
    fontFamily: 'NotoKufiArabic-Bold',
    fontSize: 20,
    color: '#4D4FFF',
    marginBottom: 15,
    textAlign: 'left',
  },
  sectionText: {
    fontFamily: 'NotoKufiArabic-Regular',
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 15, // فاصلة بين الفقرات
    
  },
  EsectionText: {
    fontFamily: 'NotoKufiArabic-Regular',
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 15, // فاصلة بين الفقرات
    
  },
});

export default Term_n_policy;
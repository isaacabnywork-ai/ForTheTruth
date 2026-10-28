import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy & Store Policies | For The Truth",
  description:
    "Privacy Policy, Return and Refund Policy, and Shipping Policy for For The Truth Press Pvt. Ltd.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-offwhite min-h-screen py-12 md:py-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <div className="mb-10 text-center sm:text-left">
          <p className="overline-label text-gold-dark">Legal &amp; Store Policies</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-charcoal md:text-4xl">
            Policies &amp; Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-charcoal/60">
            For The Truth Press Pvt. Ltd. — www.forthetruth.in
          </p>
        </div>

        <div className="space-y-10 rounded-3xl border border-sand bg-white p-7 sm:p-10 shadow-card text-sm text-charcoal/80 leading-relaxed">
          {/* Section: Return & Refund Policy */}
          <section id="return-and-refund">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-charcoal border-b border-sand pb-2 mb-4">
              Return And Refund Policy
            </h2>
            <div className="space-y-4">
              <p>
                <strong>FOR THE TRUTH PRESS PVT. LTD.</strong> does not do cash on delivery.
              </p>
              <p>
                Products that are not available for dispatch are generally not listed on{" "}
                <span className="font-semibold text-charcoal">www.forthetruth.in</span> for sale but in some cases, products may not be available for immediate dispatch. Our customer support team shall notify the customers of such instances.
              </p>
              <p>
                Upon information, the customer has the option to wait or cancel the order. In case of cancellation the following refund rules shall apply:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  We take (7-10 Business days) to complete your refund request. The refund amount will be credited to the same account as you made the payment. We will not be able to refund the amount to any other bank account or credit it to any other credit/debit card.
                </li>
                <li>
                  Your refund will happen as per the below-mentioned timelines. Please note that the refunds are dependent on external agencies such as banks, payment gateways, and external couriers (for cheques):
                </li>
              </ul>

              {/* Refund Timelines Table */}
              <div className="overflow-x-auto rounded-xl border border-sand my-4">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-cream font-bold text-charcoal">
                    <tr>
                      <th className="px-4 py-2.5 border-b border-sand">Payment Method</th>
                      <th className="px-4 py-2.5 border-b border-sand">Timeline from Refund Initiation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/60">
                    <tr>
                      <td className="px-4 py-2.5 font-medium">Debit card / Credit card / Net Banking</td>
                      <td className="px-4 py-2.5 text-charcoal/70">(2-4 Business Days)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-medium">UPI Transfer</td>
                      <td className="px-4 py-2.5 text-charcoal/70">(2-4 Business days)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <ul className="list-disc pl-5 space-y-2">
                <li>Only regular-priced items may be refunded. Sale / Discounted items are non-refundable.</li>
                <li>As soon as your refund is processed our team shall inform you of the email ID that you used for making the purchase.</li>
                <li>
                  <strong>Exceptions:</strong> Some items are non-refundable and non-exchangeable. These include: <em>[Damaged, Used]</em>.
                </li>
              </ul>

              <div className="rounded-2xl bg-cream/60 p-5 border border-sand/80 mt-4 space-y-2.5">
                <p className="font-bold text-charcoal">
                  Conditions for the return or exchange process:
                </p>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>Process for Return must be initiated within 7 days from the date of delivery of Book(s).</li>
                  <li>The book should be in good condition without any physical damage.</li>
                  <li>The book should not be used.</li>
                  <li>
                    A replacement will be provided for damaged Book(s) or faulty Book(s). If the same Book(s) are not available in stock, we give you the choice of selecting another item of the same value. We will bear the shipping charges.
                  </li>
                  <li>Before placing an order please ensure you are placing the right products.</li>
                </ol>
              </div>

              <p className="pt-2">
                For all communications regarding refund or return, please reach <strong>For The Truth Press Pvt. Ltd</strong> on{" "}
                <a href="tel:+918604685533" className="font-bold text-gold-dark hover:underline">+91 8604685533</a> during regular working hours (Monday- Saturday, 09 am to 05 pm).
              </p>

              <div className="rounded-xl bg-sand/30 p-4 border border-sand text-xs sm:text-sm">
                <p className="font-bold text-charcoal mb-1">Address for sending the Return:</p>
                <p>
                  FOR THE TRUTH PRESS<br />
                  Shop 1G/A &amp; 1G/B Kahlon Emporium III,<br />
                  Sector 18, Vrindavan Colony, Lucknow,<br />
                  Uttar Pradesh 226029<br />
                  Phone – 8604685533
                </p>
              </div>

              <p>
                We want to ensure that the customer feels satisfied and blessed by using this website. If you have any queries, please contact us at{" "}
                <a href="mailto:contact@forthetruth.in" className="text-gold-dark font-semibold hover:underline">contact@forthetruth.in</a>.
              </p>
            </div>
          </section>

          {/* Section: Shipping Policy */}
          <section id="shipping" className="border-t border-sand/70 pt-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-charcoal border-b border-sand pb-2 mb-4">
              Shipping Policy
            </h2>
            <div className="space-y-3">
              <ul className="list-disc pl-5 space-y-2">
                <li>Refunds do not include any shipping and handling charges shown on the packaging slip or invoice.</li>
                <li>Shipping charges for all returns must be prepaid and insured by you. You are responsible for any loss or damage to the product during shipment.</li>
                <li>Shipping and handling charges are not refundable. Any amounts refunded will not include the cost of shipping.</li>
              </ul>
              <p className="pt-2">
                For any queries or support, one can contact us at{" "}
                <a href="mailto:contact@forthetruth.in" className="text-gold-dark font-semibold hover:underline">contact@forthetruth.in</a> or call us at{" "}
                <a href="tel:+918604685533" className="text-gold-dark font-semibold hover:underline">+91 8604685533</a>.
              </p>
            </div>
          </section>

          {/* Section: Privacy Policy */}
          <section id="privacy" className="border-t border-sand/70 pt-8">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-charcoal border-b border-sand pb-2 mb-4">
              Privacy Policy
            </h2>
            <div className="space-y-4">
              <p>
                The term “Company” individually and collectively refers to <strong>For The Truth Press Pvt. Ltd.</strong>. The terms “You” / “Your” / “Yourself” refer to the Users.
              </p>
              <p>
                This Privacy Policy is an electronic record in the form of an electronic contract formed under the Information Technology Act, 2000 and the rules made thereunder and the amended provisions pertaining to electronic documents/records in various statutes as amended by the Information Technology Act, 2000. This Privacy Policy does not require any physical, electronic, or digital signature.
              </p>
              <p>
                This Privacy Policy is a legally binding document between You and Company (both terms defined below). The terms of this Privacy Policy will be effective upon your acceptance of the same (directly or indirectly in electronic form, by clicking on the I accept tab or by use of the website or by other means) and will govern the relationship between You and For the Truth Press Pvt. Ltd. for your use of the “Website”.
              </p>
              <p>
                This document is published and shall be construed in accordance with the provisions of the Information Technology (reasonable security practices and procedures and sensitive personal data or information) Rules, 2011 under the Information Technology Act, 2000; which require publishing of the Privacy Policy for collection, use, storage, and transfer of sensitive personal data or information.
              </p>
              <p>
                Please read this Privacy Policy carefully by using the Website, you indicate that you understand, agree, and consent to this Privacy Policy. If you do not agree with the terms of this Privacy Policy, please do not use this Website.
              </p>
              <p>
                By providing us with your Information or by making use of the facilities provided by Our Website, You hereby consent to the collection, storage, processing and transfer of any or all of Your Personal Information and Non-Personal Information by us as specified under this Privacy Policy. You further agree that such collection, use, storage, and transfer of Your Information shall not cause any loss or wrongful gain to you or any other person.
              </p>
            </div>

            <div className="mt-6 space-y-4 border-t border-sand/60 pt-6">
              <h3 className="font-display text-lg font-bold text-charcoal">User Information</h3>
              <p>
                To avail of certain services on our website, users are required to provide certain information for the registration process namely: –
              </p>
              <p className="font-medium bg-sand/20 p-3 rounded-lg text-xs sm:text-sm">
                a) Your name, b) Email address, c) Mobile or Phone Number, d) Age, e) PIN code, f) credit card or debit card details g) password, etc…
              </p>
              <p>
                All required information is service-dependent and we may use the above-mentioned user information to, maintain, protect, and improve its services (including advertising services) and for developing new services.
              </p>
              <p>
                Such information will not be considered sensitive if it is freely available and accessible in the public domain or is furnished under the Right to Information Act, 2005, or any other law for the time being in force.
              </p>
            </div>

            <div className="mt-6 space-y-4 border-t border-sand/60 pt-6">
              <h3 className="font-display text-lg font-bold text-charcoal">Cookies</h3>
              <p>
                To improve the responsiveness of the sites for our users, we may use “cookies”, or similar electronic tools to collect information to assign each visitor a unique, random number as a User Identification (User ID) to understand the user’s individual interests using the Identified Computer. Unless you voluntarily identify yourself (through registration, for example), we will have no way of knowing who you are, even if we assign a cookie to your computer. The only personal information a cookie can contain is information you supply (an example of this is when you ask for our Personalized Horoscope). A cookie cannot read data off your hard drive. Our advertisers may also assign their own cookies to your browser (if you click on their ads), a process that we do not control.
              </p>
              <p>
                Our web servers automatically collect limited information about your computer’s connection to the Internet, including your IP address, when you visit our site. (Your IP address is a number that lets computers attached to the Internet know where to send you data — such as the web pages you view.) Your IP address does not identify you personally. We use this information to deliver our web pages to you upon request, to tailor our site to the interests of our users, to measure traffic within our site, and to let advertisers know the geographic locations from where our visitors come.
              </p>
            </div>

            <div className="mt-6 space-y-4 border-t border-sand/60 pt-6">
              <h3 className="font-display text-lg font-bold text-charcoal">Links to the Other Sites</h3>
              <p>
                Our policy discloses the privacy practices for our own website only. Our site provides links to other websites that are beyond our control. We shall in no way be responsible for your use of such sites.
              </p>
            </div>

            <div className="mt-6 space-y-4 border-t border-sand/60 pt-6">
              <h3 className="font-display text-lg font-bold text-charcoal">Information Sharing</h3>
              <p>
                We share sensitive personal information with any third party without obtaining the prior consent of the user in the following limited circumstances:
              </p>
              <div className="space-y-2 pl-4">
                <p>
                  <strong>(a)</strong> When it is requested or required by law or by any court or governmental agency or authority to disclose, for the purpose of verification of identity, or for the prevention, detection, investigation including cyber incidents, or for prosecution and punishment of offenses. These disclosures are made in good faith and belief that such disclosure is reasonably necessary for enforcing these Terms; and for complying with the applicable laws and regulations.
                </p>
                <p>
                  <strong>(b)</strong> We propose to share such information within its group companies and officers and employees of such group companies for the purpose of processing personal information on its behalf. We also ensure that these recipients of such information agree to process such information based on our instructions and in compliance with this Privacy Policy and any other appropriate confidentiality and security measures.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t border-sand/60 pt-6">
              <h3 className="font-display text-lg font-bold text-charcoal">Underage Users</h3>
              <p>
                If you are under the age of eighteen (18) years, you may use this website and purchase products and services through the use of this website only with the involvement and under the supervision of a parent or legal guardian.
              </p>
            </div>

            <div className="mt-6 space-y-4 border-t border-sand/60 pt-6">
              <h3 className="font-display text-lg font-bold text-charcoal">Information Security</h3>
              <p>
                We take appropriate security measures to protect against unauthorized access to or unauthorized alteration, disclosure, or destruction of data. These include internal reviews of our data collection, storage, and processing practices, and security measures, including appropriate encryption and physical security measures to guard against unauthorized access to systems where we store personal data.
              </p>
              <p>
                All information gathered on our Website is securely stored within our controlled database. The database is stored on servers secured behind a firewall; access to the servers is password-protected and is strictly limited. However, as effective as our security measures are, no security system is impenetrable. We cannot guarantee the security of our database, nor can we guarantee that the information you supply will not be intercepted while being transmitted to us over the Internet. And, of course, any information you include in a posting to the discussion areas is available to anyone with Internet access.
              </p>
              <p>
                However, the internet is an ever-evolving medium. We may change our Privacy Policy from time to time to incorporate necessary future changes. Of course, our use of any information we gather will always be consistent with the policy under which the information was collected, regardless of what the new policy may be.
              </p>
              <p>
                For The Truth Press Pvt. Ltd. reserves the right to modify this privacy policy at any time, so please review it frequently. If we make material changes to this policy, we will notify you here or by means of a notice on our homepage so that you are aware of what information we collect.
              </p>
              <p>
                We are committed to conducting our business in accordance with these principles in order to ensure that the confidentiality of personal information is protected and maintained.
              </p>
              <p className="pt-2">
                For any queries or support, one can contact us at{" "}
                <a href="mailto:contact@forthetruth.in" className="text-gold-dark font-semibold hover:underline">contact@forthetruth.in</a> or call us at{" "}
                <a href="tel:+918604685533" className="text-gold-dark font-semibold hover:underline">+91 8604685533</a>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

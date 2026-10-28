import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Statement of Faith | For The Truth",
  description:
    "The doctrinal convictions and Statement of Faith of FOR THE TRUTH PRESS — Scripture, God, Christ, Salvation, the Church, and Eternity.",
};

const ARTICLES = [
  {
    number: "01",
    title: "Scripture — The Holy Bible",
    paragraphs: [
      "We believe that God has revealed Himself in the Bible which consists of 66 books of the Old and New Testaments. The Bible is fully, uniquely and supernaturally the Word of God (2 Timothy 3:16). It was written by men through the inspiration of the Holy Spirit (2 Peter 1:20-21). Because we are finite and sinful beings, we cannot know God’s truth completely, but with the help of the enlightening work of the Holy Spirit we are able to know God’s truth revealed in the Bible truly (Psalm 119:18; 1 Corinthians 2:12).",
      "The Bible is the only infallible, inerrant, sufficient, authoritative, and final rule for the faith and life of Christ’s disciples (Psalm 19:7; Isaiah 55:10-11; Matthew 24:35). Thus, there is no need for further revelation beyond the full and final revelation of the Bible (Revelation 22:18-19; Proverbs 30:5-6). It is the supreme standard by which all human behaviour, beliefs, and opinions will be judged by God (Hebrews 4:12-13).",
    ],
  },
  {
    number: "02",
    title: "The One True God",
    paragraphs: [
      "We believe that there is one, and only one true living God (Deuteronomy 6:4). He is an infinite, uncreated, eternal, intelligent Spirit (Isaiah 40:28). He is the creator of everything and the sovereign ruler of heaven and earth (Revelation 4:11). He is inexpressibly glorious in holiness and is worthy of our worship, honour and service (Isaiah 6:3). God is immutable (unchangeable) in his holiness, justice, wisdom, mercy, and love (Numbers 23:19; James 1:17). And God, in all his perfection does all things for His own glory (Isaiah 48:9, 11). Sinful humanity cannot know God apart from God’s gracious self-revelation (Romans 3:11).",
      "This one true God eternally co-exists in three persons: The Father, The Son, and The Holy Spirit (Matthew 28:19; John 14:26; 2 Corinthians 13:14). The three persons of the Trinity have distinct roles but perfect unity of purpose in accomplishing our salvation for the glory of God (1 Peter 1:2).",
    ],
  },
  {
    number: "03",
    title: "God the Son",
    paragraphs: [
      "We believe that Jesus is the Christ, the Son of God (Mark 1:1). He is the only incarnation of the one true God, who perfectly reveals God to man (John 1:14; Colossians 1:15-16). In Jesus Christ the transcendent God becomes immanent (John 1:18). The Lord Jesus Christ is truly God and truly man (1 John 5:20; Hebrews 2:17).",
      "We believe that he was conceived by the Holy Spirit, born of a virgin (Matthew 1:20, 23), lived a sinless life, died on the cross in the place of sinners (penal substitutionary atonement), bearing God’s punishment for their sin (propitiation) (1 John 2:1), redeeming them by his blood (Ephesians 1:7). He rose from the dead (Acts 2:23-24), ascended into heaven (Acts 1:10), is seated at the right hand of the Father (Hebrews 1:3), and being the only mediator between God and man (1 Timothy 2:5), he intercedes for his people in the presence of the Father (Romans 8:34).",
    ],
  },
  {
    number: "04",
    title: "God the Holy Spirit",
    paragraphs: [
      "We believe that the Holy Spirit is sent from heaven by the Father (John 14:26) and the Son (John 15:26) to glorify Christ and to apply the work of salvation in the lives of people. He convicts the world concerning sin (John 16:8), gives new birth (regeneration) (John 3:5) and gives a true understanding of the Scriptures.",
      "All true believers have been baptized by the Holy Spirit (1 Corinthians 12:13), and he lives within them (1 Corinthians 6:19), bringing assurance of salvation and enabling them to live godly lives according to Scripture (Romans 8:13-14). He brings believers into the Body of Christ, builds up the Church and empowers its members for worship, service and mission (Ephesians 5:18-20). He does this by giving different people in the church different gifts for the building up of the church according to his will (1 Corinthians 12:4-6). (This means no one should require anyone to have any one specific gift in order to be a Christian or to be more spiritual).",
    ],
  },
  {
    number: "05",
    title: "Man",
    paragraphs: [
      "We believe that man was created in the image of God (Genesis 1:26-27). God created man as male and female, having equal dignity and worth, but distinct roles (Genesis 1:27, 2:18). (This is affirmed in the complementarian position on gender roles). The purpose of man’s existence is to glorify God by worshipping, obeying, loving, and enjoying God (Psalm 37:4; Revelation 4:11).",
      "But because of sin, every intention of our hearts is corrupt, and our nature is polluted (total depravity) (Genesis 6:5; Romans 5:12). We are sinners both by nature and deed (1 John 1:8, 10), and every unrepentant (unregenerate) man is under God’s perfect, righteous, and eternal wrath (Romans 1:18; Ephesians 2:3). We desperately need forgiveness for our sins and to be reconciled to the one holy God (Hebrews 9:27).",
    ],
  },
  {
    number: "06",
    title: "Salvation",
    paragraphs: [
      "Salvation is being spiritually born again (John 3:3), having the penalty of our sins forgiven (1 John 2:2), being reconciled to the one true God (Romans 5:1), experiencing true internal spiritual peace, and the assurance of eternal life (life after life) (1 Peter 1:3).",
      "We believe that salvation is by grace alone through faith alone in the Lord Jesus Christ alone (Ephesians 2:8; Titus 3:5). This is not by our works (of tradition, religion, morality, ethics, or self-effort) (Ephesians 2:9). The work of salvation was accomplished by the Lord Jesus Christ through his life and death on the cross and is freely made available to anyone who believes through the proclamation of the gospel (John 3:16). Because of his love, God elects (Ephesians 1:4), predestines, adopts (Ephesians 1:5), redeems, forgives (Ephesians 1:7), justifies, sanctifies, and glorifies his people (Romans 8:30).",
    ],
  },
  {
    number: "07",
    title: "Justification and Sanctification",
    paragraphs: [
      "We believe that Justification is the great gospel blessing that Christians receive by believing in Jesus. It is a legal act where God declares men to be righteous in his sight because all their sins have been freely forgiven by God, and Christ’s righteousness is counted (imputed) as their own (Romans 4:25; 5:1). It is an instantaneous, once and for all act of God in its entirety, in which he deems sinners to be just and righteous completely because of his grace. In other words, in Justification, sinners are declared to be Christ-like. Justification is received by faith alone, through grace alone, in Christ Jesus alone (Galatians 2:16; Romans 3:24, 28).",
      "Sanctification, on the other hand, is a progressive act of growing in Christlikeness. It is an actual internal spiritual change in a person whereby we are made partakers of God’s holiness (John 17:17, 19). This work which began in us at the time of regeneration is now carried on in the hearts and lives of believers by the presence and the power of the Holy Spirit (Philippians 1:6; Galatians 5:22-23). He works in us as we use the means given to us such as the Word of God, the fellowship of believers, prayer, self-examination, self-denial, watchfulness etc. to conform us to the likeness of Christ (2 Corinthians 3:18; Philippians 2:12-13).",
    ],
  },
  {
    number: "08",
    title: "Spiritual Regeneration (Conversion / Born Again)",
    paragraphs: [
      "We believe that all men, regardless of their caste, colour or creed, are born dead in their sins (Romans 3:10; Ephesians 2:1). They are unable to save themselves of their own initiative. In spiritual regeneration, the Holy Spirit changes hearts (Ezekiel 36:26; John 3:5-6), gives new life to people who were dead in sins (Ephesians 2:5), enables them to believe in the gospel, and to repent from their sins (Ephesians 1:13; 1 Peter 1:23-25).",
      "According to the Bible, Spiritual Regeneration (Conversion/ Born Again) is completely a supernatural, internal, spiritual, invisible act of God’s Holy Spirit and cannot be done by force, enticement, or allurement (Titus 3:5-7).",
    ],
  },
  {
    number: "09",
    title: "Baptism and the Lord’s Supper",
    paragraphs: [
      "We believe that baptism and the Lord’s Supper are the two ordinances instituted by the Lord Jesus Christ for the church to display the gospel.",
      "In Christian baptism, the one who has professed repentance towards God, faith in, and obedience to, our Lord Jesus Christ is immersed in water and is baptised in the name of the Father, Son, and Holy Spirit (Matthew 28:19). This is a sign of our death to sin and resurrection to new life in Christ Jesus (Romans 6:3-4). Baptism does not give us salvation, but it is an outward display of the internal work of the Holy Spirit in a Christian. It is an act in which a believer publicly commits himself to Christ, symbolising union with him, entrance into his church, and being marked off from the world (Acts 2:41).",
      "The Lord’s Supper is observed by baptized believers in the church in remembrance of Christ’s once and for all sacrifice on the cross (Luke 22:14-20). In the Lord’s Supper the bread and the wine are symbols of Jesus’ body and his blood that were broken and shed for the forgiveness of sins of his people (1 Corinthians 11:24-25). The elements (bread and wine) do not change their substance in any way. The Lord’s Supper is an opportunity for the church for solemn self-examination (1 Corinthians 11:28). It is also a joyful celebration to commemorate the dying love of Jesus Christ as one family. The church should continue observing this ordinance in unity until Christ returns (1 Corinthians 11:26).",
    ],
  },
  {
    number: "10",
    title: "The Church",
    paragraphs: [
      "We believe in the spiritual unity of all believers of all ages from every race, nation and language. They are all part of Christ’s body, the universal church, of which Christ is the only head (Matthew 16:18; Ephesians 1:22-23; Colossians 1:18).",
      "This universal church is made visible in local churches. Each “local church” is the household of God (Ephesians 2:19), the assembly of the living God, and the pillar and foundation of the truth (1 Timothy 3:15). The local church is a group of baptized believers who have covenanted to gather regularly to worship God, to encourage one another, to hear the preaching of the Word, to receive pastoral care and discipline, to evangelise, and to observe the ordinances (Acts 2:42; Hebrews 10:24-25). The purpose of the church is to display the glory of God (Ephesians 3:9-10).",
      "The two Biblical offices in the local church are those of elders (bishops/overseers/pastors) (Acts 20:28; 1 Timothy 3:1), who lead the church by teaching and praying, and deacons (servants), who serve the church in practical ways (Acts 6:2-3;20:28; 1 Timothy 3:1, 8). The unity of the body of Christ is expressed within and between churches by mutual love, care and encouragement. True fellowship between churches exists only where they are faithful to the gospel (Galatians 2:9).",
    ],
  },
  {
    number: "11",
    title: "The Future",
    paragraphs: [
      "We believe that at the end of the ages the Lord Jesus Christ will return in his glory (Acts 1:11; 1 Corinthians 4:5; Revelation 22:20). God will raise the dead again and judge the world in righteousness through Jesus Christ our Lord (1 Corinthians 15:52; Hebrews 9:27).",
      "The wicked (those who rejected Jesus Christ) will be sent to eternal punishment in hell, and the righteous (those who put their trust in Jesus Christ) will have eternal life in the New Heavens and New Earth (John 3:36; 5:28-29; Acts 24:15; Revelation 20:15). In the New Creation, there will be no sin, sickness, pain, or death (Isaiah 65:17; Revelation 21:1, 4, 27).",
    ],
  },
];

export default function StatementOfFaithPage() {
  return (
    <div className="bg-offwhite min-h-screen">
      {/* Hero */}
      <section className="bg-navy-gradient py-16 text-white md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-light">
            Our Doctrinal Foundation
          </p>
          <h1 className="mt-4 font-display text-3xl font-black text-white sm:text-4xl md:text-5xl tracking-tight">
            Statement of Faith
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            What we believe and teach at FOR THE TRUTH PRESS — grounded solely in the inerrant Word of God.
          </p>
        </div>
      </section>

      {/* Main Articles */}
      <section className="mx-auto max-w-4xl px-4 py-12 md:py-16 lg:px-8">
        <div className="space-y-8">
          {ARTICLES.map((art) => (
            <article
              key={art.number}
              className="rounded-3xl border border-sand bg-white p-7 sm:p-9 shadow-card transition-all duration-200 hover:border-gold/40"
            >
              <div className="flex items-baseline gap-3 border-b border-sand pb-3 mb-5">
                <span className="font-display text-xl sm:text-2xl font-black text-gold-dark">
                  {art.number}.
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-charcoal">
                  {art.title}
                </h2>
              </div>
              <div className="space-y-4 text-sm sm:text-base leading-relaxed text-charcoal/80">
                {art.paragraphs.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 rounded-3xl bg-cream p-8 text-center border border-sand/80 shadow-sm md:p-10">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-charcoal">
            Browse Faithful Biblical Books
          </h3>
          <p className="mt-2 text-xs sm:text-sm text-charcoal/65 max-w-md mx-auto">
            Discover resources aligned with sound doctrine, rich theology, and gospel-centred living.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/products" className="btn-cta text-sm px-6 py-2.5">
              Explore All Books →
            </Link>
            <Link href="/about" className="btn-outline text-sm px-6 py-2.5">
              About Our Ministry
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

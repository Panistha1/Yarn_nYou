import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";

import "../styles/home.css";

function Home() {

const products = [
    {
      image:"/images/bliss.webp",
         title: "Berry Bliss Strawberry",
      price: "Rs 90"
    },
    {
      image:"/images/panda.jpg",
      title: "Panda",
      price: "Rs 200"
    },
    {image:"/images/sunflower.jpg",
      title: "Sunflower",
      price: "Rs 90"
    },
    {image:"/images/koala.jpg",
      title: "Cozy Koala",
      price: "Rs 240"
    }
  ];
return(

<>

<Navbar/>


<section className="hero">

<div className="hero-left">

<h1>
Handmade <br/>
<span>Crochet</span>
<br/>
Happiness
</h1>

<p align="justify">

Discover a world of cozy,
hand-knotted keychains
and accessories designed
to bring a little extra joy
to your everyday carry.

</p>


<div className="hero-buttons">

<button className="shop-btn">
Shop Keychains
</button>


</div>


<div className="hero-stats">

<div>
<h2>5k+</h2>
<p>Happy Loops</p>
</div>

<div>
<h2>100%</h2>
<p>Handcrafted</p>
</div>

</div>

</div>


<div className="hero-right">

<img
src="/images/hh.png"
alt="crochet"
/>
</div>
</section>
<section className="products-section">

<div className="section-title">

<h2>New Arrivals</h2>

<p>

Freshly stitched and ready
for their forever homes.

</p>
</div>
<div className="marquee">

<div className="marquee-content">
    {products.map((item, index) => (
      <ProductCard
        key={`first-${index}`}
        image={item.image}
        title={item.title}
        price={item.price}
      />
    ))}
    
    {/* Second set of items (Visual Duplicate) */}
    {products.map((item, index) => (
      <ProductCard
        key={`second-${index}`}
        image={item.image}
        title={item.title}
        price={item.price}
      />
    ))}
</div>

</div>

</section>



<section className="features">

<div className="feature-box">

<h3>Made with Love</h3>

<p>
Every stitch is hand-hooked
by passionate creators.
</p>

</div>


<div className="feature-box">

<h3>Premium Quality</h3>

<p>
Soft cotton yarn and
durable craftsmanship.
</p>

</div>


<div className="feature-box">

<h3>Cute Packaging</h3>

<p>
Packed beautifully with
personalized touches.
</p>

</div>

</section>


<Footer/>

</>

);

}

export default Home;
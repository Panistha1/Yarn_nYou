function ProductCard({
image,
title,
price
}){

return(

<div className="card">

<img src={image} alt={title}/>

<h3>{title}</h3>

<p>{price}</p>

<button> Add To Cart </button>
 </div>

);

}

export default ProductCard;
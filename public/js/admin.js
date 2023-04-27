let Fname = document.getElementById("nameField")
let Fbrand = document.getElementById("brandField")
let Fmodel = document.getElementById("modelField")
let Fprice = document.getElementById("priceField")
let Farticle = document.getElementById("articleField")
let removeShoesField = document.getElementById("removeShoesField")

async function addShoes() {
    let shoe = {
        name: Fname.value,
        brand: Fbrand.value,
        model: Fmodel.value,
        price: Fprice.value,
        article: Farticle.value
    }

    console.log(shoe);
    
        const res = await fetch("/addShoes",
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    parcel: {
                    shoe
                    }
                })
            })
            const data = await res.json()
            console.log(data);
    
}

async function removeShoes() {
    console.log(removeShoesField.value);
    
    const res = await fetch("/removeShoes",
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                parcel: {
                "articlenmbr": Farticle.value
                }
            })
        })
        const data = await res.json()
        console.log(data);
}

async function updateShoes() {
    console.log(`name: ${Fname.value}, empty?: ${Fname.value == ""}`); 
    console.log(`brand: ${Fbrand.value}, empty?: ${Fbrand.value == ""}`); 
    console.log(`model: ${Fmodel.value}, empty?: ${Fmodel.value == ""}`); 
    console.log(`price: ${Fprice.value}, empty?: ${Fprice.value == ""}`); 
    
    let details = [Fname.value, Fbrand.value, Fmodel.value, Fprice.value]

    let shoe = {
        name: "",
        brand: "",
        model: "",
        price: ""
      };

      if (Fname.value !== "") {
        shoe.name = Fname.value;
      }
      if (Fbrand.value !== "") {
        shoe.brand = Fbrand.value;
      }
      if (Fmodel.value !== "") {
        shoe.model = Fmodel.value;
      }
      if (Fprice.value !== "") {
        shoe.price = Fprice.value;
      }
    console.log(shoe);

    let articlenumber = Farticle.value

    console.log(`article to update: ${articlenumber}`); 
    
    const res = await fetch("/updateShoes",
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                parcel: {
                shoe, articlenumber
                }
            })
        })
        const data = await res.json()
        console.log(data);
}
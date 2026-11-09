var GrillImageAPI = {

    getProductImage: function(product) {

        if (product.image != null && product.image != "") {
            return product.image;
        }

        var name = product.name.toLowerCase();

        if (name.indexOf("fries") != -1) {
            return "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600";
        }

        if (name.indexOf("nugget") != -1) {
            return "https://images.unsplash.com/photo-1562967914-608f82629710?w=600";
        }

        if (name.indexOf("cola") != -1) {
            return "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600";
        }

        if (name.indexOf("juice") != -1) {
            return "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600";
        }

        if (name.indexOf("chicken") != -1) {
            return "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600";
        }

        if (name.indexOf("burger") != -1) {
            return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600";
        }

        return "https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=600";
    },

    getFallbackEmoji: function(category) {

        if (category == "Burgers") {
            return "🍔";
        }

        if (category == "Sides") {
            return "🍟";
        }

        if (category == "Drinks") {
            return "🥤";
        }

        return "🍽️";
    }
};
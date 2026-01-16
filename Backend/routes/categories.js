const express=require("express")
const Category=require("../models/category")

const router=express.Router();

router.post("/categories",async(req,res)=>{
const {name,items}=req.body

const new_data=await Category.create({ name:name, items:items})
res.json({new_data})
})

router.get("/getcategory",async(req,res)=>{
    // const {name}=req.query
    const exsiting_data=await Category.find({})
    res.json({exsiting_data})
})


// UPDATE CATEGORY
router.put("/category/:id", async (req, res) => {
  try {
    const { name, items } = req.body;

    // Ensure items is converted correctly
    let itemsArray = [];

    if (Array.isArray(items)) {
      itemsArray = items.map(i => i.trim()).filter(i => i !== "");
    } 
    else if (typeof items === "string" && items.trim() !== "") {
      itemsArray = items.split(",").map(i => i.trim()).filter(i => i !== "");
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      { name, items: itemsArray },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      message: "Category updated successfully",
      category: updated
    });

  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({
      message: "Server error while updating category",
      error
    });
  }
});


// DELETE CATEGORY
router.delete("/category/:id", async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      message: "Category deleted successfully",
      deleted
    });

  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      message: "Server error while deleting category",
      error
    });
  }
});








module.exports = router; 
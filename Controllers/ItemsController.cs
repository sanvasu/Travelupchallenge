using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Traveluptest.Data;
using Traveluptest.Models;

namespace Traveluptest.Controllers
{
    public class ItemsController : Controller
    {
        private readonly AppDbContext _context;

        public ItemsController(AppDbContext context)
        {
            _context = context;
        }

        public IActionResult Index()
        {
            var items = _context.Items.AsNoTracking().OrderByDescending(item => item.Id).ToList();
            return View(items);
        }

        [HttpGet]
        public IActionResult GetItems()
        {
            var items = _context.Items.ToList();
            return Ok(items); // Return 200 OK with the list of items
        }

        // GET: api/items/{id}
        [HttpGet("{id}")]
        public IActionResult GetItem(int id)
        {
            var item = _context.Items.Find(id);
            if (item == null)
            {
                return NotFound(); // Return 404 Not Found if item doesn't exist
            }
            return Ok(item); // Return 200 OK with the item
        }


        // GET: Items/CreateItems - CreateItems View
        public IActionResult CreateItems(int? id)
        {
            return View(new Item());
        }

        // POST: Create or Update Item
        [HttpPost]
        public IActionResult AddItem([FromBody] Item item)
        {
            if (ModelState.IsValid)
            {
                if (item.Id == 0) // New item
                {
                    _context.Items.Add(item);
                }
                else // Edit existing item
                {
                    _context.Items.Update(item);
                }
                _context.SaveChanges();
                TempData["SuccessMessage"] = "Item added successfully!";
                return Json(new { success = true, item }); // Redirect to the Index after successful operation
            }
            return Json(new { success = false, message = "Failed to add item. Please check your input." });// Return to the CreateItems view with validation errors
        }

        [HttpPost]
        public IActionResult EditItem([FromBody] Item item)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    if (item.Id == 0) // This shouldn't happen for an edit operation
                    {
                        _context.Items.Add(item); // Add if it's a new item (not likely for Edit)
                    }
                    else // Edit existing item
                    {
                        var existingItem = _context.Items.Find(item.Id);
                        if (existingItem != null)
                        {
                            // Update properties
                            _context.Entry(existingItem).State = EntityState.Detached;

                            // Update properties
                            existingItem.Name = item.Name;
                            existingItem.Description = item.Description;
                            existingItem.ModifiedDate = DateTime.Now;
                            _context.Items.Update(existingItem);
                        }
                        // Update the existing item
                    }

                    _context.SaveChanges(); // Save the changes to the database
                    return Json(new { success = true, message = "Item updated successfully!" }); // Return success message
                }
                catch (Exception ex)
                {
                    // Log the exception (optional)
                    return Json(new { success = false, message = "An error occurred while updating the item: " + ex.Message }); // Return error message
                }
            }

            // Log ModelState errors for debugging
            var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
            return Json(new { success = false, message = "Validation failed.", errors }); // Return validation error messages
        }
        // POST: Delete Item
        [HttpPost]
        public IActionResult DeleteItem([FromBody] Item itemid)
        {
            var item = _context.Items.Find(itemid.Id);
            if (item != null)
            {
                _context.Items.Remove(item);
                _context.SaveChanges();
                return Json(new { success = true });
            }
            return Json(new { success = false, message = "Item not found." });
        }
    }
}

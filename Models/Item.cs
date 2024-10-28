using System.ComponentModel.DataAnnotations;

namespace Traveluptest.Models
{
    public class Item
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; }

        public DateTime? CreateDate { get; set; } // For new items
        public DateTime? ModifiedDate { get; set; } // Added for tracking modifications
    }
}

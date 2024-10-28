using Microsoft.EntityFrameworkCore;
using Traveluptest.Models;

namespace Traveluptest.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Item> Items { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Item>()
                .Property(i => i.CreateDate)
                .HasColumnName("CreateDate"); // Ensure it matches your column name
        }
    }
}

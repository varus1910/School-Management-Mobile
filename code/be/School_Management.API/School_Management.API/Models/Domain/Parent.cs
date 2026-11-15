using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class Parent
    {
        [Key]
        public Guid Id { get; set; }

        //FK
        public Guid UserId { get; set; }

        //Navigation property
        [ForeignKey("UserId")]
        public AppUser? User { get; set; }
        public ICollection<ParentStudent> ParentStudents { get; set; } = new List<ParentStudent>();
    }
}

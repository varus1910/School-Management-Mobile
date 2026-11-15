using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace School_Management.API.Models.Domain
{
    public class ParentStudent
    {
        [Key]
        public Guid ParentStudentId { get; set; }
        public Guid ParentId { get; set; }
        public Guid StudentId { get; set; }

        // Father / Mother / Guardian
        public string? Relationship { get; set; }

        //Navigation properties
        [ForeignKey("ParentId")]
        public Parent? Parent { get; set; }

        [ForeignKey("StudentId")]
        public Student? Student { get; set; }
    }
}

using System.ComponentModel.DataAnnotations;

namespace School_Management.API.Models.DTO
{
    public class LinkChildRequest
    {
        [Required(ErrorMessage = "Học sinh là bắt buộc")]
        public Guid StudentId { get; set; }

        [MaxLength(50, ErrorMessage = "Quan hệ quá dài")]
        public string? Relationship { get; set; }
    }
}

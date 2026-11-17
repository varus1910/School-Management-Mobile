namespace School_Management.API.Models.DTO
{
    public class ChildInfoResponse
    {
        public Guid StudentId { get; set; }
        public Guid UserId { get; set; }
        public string? FullName { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Relationship { get; set; }
        public string? ClassName { get; set; }
        public int? Grade { get; set; }
        public int? SchoolYear { get; set; }
    }
}

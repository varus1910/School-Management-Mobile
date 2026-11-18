using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace School_Management.API.Migrations
{
    /// <inheritdoc />
    public partial class AddParentRole : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Parent",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parent", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Parent_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ParentStudent",
                columns: table => new
                {
                    ParentStudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    ParentId = table.Column<Guid>(type: "uuid", nullable: false),
                    StudentId = table.Column<Guid>(type: "uuid", nullable: false),
                    Relationship = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParentStudent", x => x.ParentStudentId);
                    table.ForeignKey(
                        name: "FK_ParentStudent_Parent_ParentId",
                        column: x => x.ParentId,
                        principalTable: "Parent",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ParentStudent_Student_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Student",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Role",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[] { new Guid("5c1f7a3e-9b24-4d86-8a51-3e7d2c9f4b10"), "5c1f7a3e-9b24-4d86-8a51-3e7d2c9f4b10", "Parent", "PARENT" });

            migrationBuilder.CreateIndex(
                name: "IX_Parent_UserId",
                table: "Parent",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ParentStudent_ParentId_StudentId",
                table: "ParentStudent",
                columns: new[] { "ParentId", "StudentId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ParentStudent_StudentId",
                table: "ParentStudent",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ParentStudent");

            migrationBuilder.DropTable(
                name: "Parent");

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("5c1f7a3e-9b24-4d86-8a51-3e7d2c9f4b10"));
        }
    }
}
